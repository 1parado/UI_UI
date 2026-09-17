import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QRCode } from './QRCode'

const viewBoxSize = (container: HTMLElement) => {
  const box = container.querySelector('svg')?.getAttribute('viewBox') ?? ''
  return Number(box.split(' ')[2])
}

describe('QRCode', () => {
  it('renders a named image', () => {
    render(<QRCode value="https://example.com/pair?token=abc" label="Pairing code" />)

    const image = screen.getByRole('img', { name: 'Pairing code' })
    expect(image.tagName).toBe('svg')
    expect(image.querySelector('title')).toHaveTextContent('Pairing code')
  })

  it('paints a white quiet zone under the code', () => {
    const { container } = render(<QRCode value="https://example.com" />)

    // Dark modules on a light ground is what scanners expect. This background
    // is deliberately not a theme token — see the component docs.
    expect(container.querySelector('path[fill="#ffffff"]')).not.toBeNull()
    expect(container.querySelector('path[fill="#111827"]')).not.toBeNull()
  })

  it('takes the spec quiet zone by default', () => {
    const { container: withDefault } = render(<QRCode value="https://example.com" />)
    const { container: without } = render(
      <QRCode value="https://example.com" marginSize={0} />
    )

    // The code itself is the same size; the margin is the difference.
    expect(viewBoxSize(withDefault) - viewBoxSize(without)).toBe(8)
  })

  it('honours explicit colours', () => {
    const { container } = render(
      <QRCode value="https://example.com" bgColor="#000000" fgColor="#ffffff" />
    )

    expect(container.querySelector('path[fill="#000000"]')).not.toBeNull()
    expect(container.querySelector('path[fill="#ffffff"]')).not.toBeNull()
  })

  it('renders a canvas when asked, for exporting', () => {
    const { container } = render(<QRCode as="canvas" value="https://example.com" label="Exportable" />)

    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas).toHaveAttribute('width', '200')
    expect(screen.getByRole('img', { name: 'Exportable' })).toBe(canvas)
  })

  it('does not leak the render target onto the element', () => {
    const { container } = render(<QRCode as="canvas" value="https://example.com" />)

    expect(container.querySelector('canvas')).not.toHaveAttribute('as')
  })

  it('sizes the output', () => {
    const { container } = render(<QRCode value="https://example.com" size={160} />)

    expect(container.querySelector('svg')).toHaveAttribute('width', '160')
    expect(container.querySelector('svg')).toHaveAttribute('height', '160')
  })

  it('passes through the props a caller needs for layout', () => {
    const { container } = render(
      <QRCode value="https://example.com" className="mx-auto" style={{ opacity: 0.9 }} />
    )

    const svg = container.querySelector('svg') as SVGElement
    expect(svg).toHaveClass('mx-auto')
    expect(svg.style.opacity).toBe('0.9')
  })

  it('accepts segments instead of one string', () => {
    const { container } = render(<QRCode value={['https://example.com/', 'pair']} />)

    expect(container.querySelector('svg')).not.toBeNull()
  })
})
