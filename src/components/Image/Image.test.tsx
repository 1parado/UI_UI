import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Image } from './Image'

const picture = () => screen.getByAltText('A quiet desk')

describe('Image', () => {
  it('defer below-the-fold work by default', () => {
    render(<Image src="/desk.png" alt="A quiet desk" />)

    expect(picture()).toHaveAttribute('loading', 'lazy')
    expect(picture()).toHaveAttribute('decoding', 'async')
  })

  it('loads eagerly when asked, for pictures above the fold', () => {
    render(<Image src="/hero.png" alt="A quiet desk" lazy={false} />)

    expect(picture()).toHaveAttribute('loading', 'eager')
  })

  it('fades the picture in only once it has arrived', () => {
    render(<Image src="/desk.png" alt="A quiet desk" />)

    expect(picture()).toHaveAttribute('data-loaded', 'false')
    fireEvent.load(picture())
    expect(picture()).toHaveAttribute('data-loaded', 'true')
  })

  it('passes image-only attributes straight through', () => {
    render(
      <Image
        src="/desk.png"
        alt="A quiet desk"
        srcSet="/desk.png 1x, /desk@2x.png 2x"
        sizes="(max-width: 600px) 100vw, 640px"
        width={640}
        height={480}
      />
    )

    expect(picture()).toHaveAttribute('srcset', '/desk.png 1x, /desk@2x.png 2x')
    expect(picture()).toHaveAttribute('sizes', '(max-width: 600px) 100vw, 640px')
    expect(picture()).toHaveAttribute('width', '640')
  })

  it('falls back to text when the file cannot load', () => {
    render(<Image src="/missing.png" alt="A quiet desk" />)

    fireEvent.error(picture())

    expect(screen.queryByAltText('A quiet desk')).not.toBeInTheDocument()
    expect(screen.getByText('A quiet desk could not be loaded')).toBeInTheDocument()
  })

  it('lets the caller draw the failure instead', () => {
    render(<Image src="/missing.png" alt="A quiet desk" fallback={<span>Broken link</span>} />)

    fireEvent.error(picture())

    expect(screen.getByText('Broken link')).toBeInTheDocument()
  })

  it('stretches to the parent when filled', () => {
    render(<Image src="/desk.png" alt="A quiet desk" fill fit="contain" />)

    expect(picture()).toHaveClass('absolute', 'inset-0', 'object-contain')
  })

  it('opens the zoomable preview on click, once loaded', async () => {
    const user = userEvent.setup()
    render(<Image src="/desk.png" alt="A quiet desk" preview />)

    fireEvent.load(picture())
    await user.click(picture())

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByAltText('A quiet desk')).toBeInTheDocument()
  })

  it('uses a bigger file for the preview when given one', async () => {
    const user = userEvent.setup()
    render(
      <Image src="/desk-thumb.png" previewSrc="/desk-full.png" alt="A quiet desk" preview />
    )

    fireEvent.load(picture())
    await user.click(picture())

    expect(within(screen.getByRole('dialog')).getByAltText('A quiet desk')).toHaveAttribute(
      'src',
      '/desk-full.png'
    )
  })

  it('zooms from the buttons and stops at the ceiling', async () => {
    const user = userEvent.setup()
    render(<Image src="/desk.png" alt="A quiet desk" preview maxZoom={2} zoomStep={0.5} />)

    fireEvent.load(picture())
    await user.click(picture())

    const shown = () => within(screen.getByRole('dialog')).getByAltText('A quiet desk')

    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(shown()).toHaveAttribute('data-zoom', '1.50')

    await user.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(shown()).toHaveAttribute('data-zoom', '1.00')
  })

  it('leaves a plain picture alone when preview is off', async () => {
    const user = userEvent.setup()
    render(<Image src="/desk.png" alt="A quiet desk" />)

    fireEvent.load(picture())
    await user.click(picture())

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('still reports loading and failing to the caller', () => {
    const onLoad = vi.fn()
    const onError = vi.fn()
    render(<Image src="/desk.png" alt="A quiet desk" onLoad={onLoad} onError={onError} />)

    fireEvent.load(picture())
    expect(onLoad).toHaveBeenCalledTimes(1)

    fireEvent.error(picture())
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
