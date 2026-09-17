import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Anchor } from './Anchor'

const items = [
  { id: 'intro', title: 'Introduction' },
  {
    id: 'install',
    title: 'Install',
    children: [{ id: 'install-pnpm', title: 'pnpm' }],
  },
  { id: 'api', title: 'API', disabled: true },
]

describe('Anchor', () => {
  it('renders real links, so they work without JavaScript', () => {
    render(<Anchor items={items} />)

    expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'href',
      '#intro'
    )
  })

  it('nests children under their parent', () => {
    render(<Anchor items={items} />)

    expect(screen.getByRole('link', { name: 'pnpm' })).toBeInTheDocument()
  })

  it('marks the current section with aria-current', () => {
    render(<Anchor items={items} />)

    // Nothing has been scrolled yet, so the first section is current.
    expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'aria-current',
      'location'
    )
  })

  it('follows a click and reports the section', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true })

    // Give the target a real node to jump to. "api" is disabled in the
    // fixture, so this jumps to "install" instead.
    const target = document.createElement('div')
    target.id = 'install'
    document.body.appendChild(target)

    render(<Anchor items={items} onChange={onChange} />)
    await user.click(screen.getByRole('link', { name: 'Install' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' })
    expect(onChange).toHaveBeenCalledWith('install')
    expect(screen.getByRole('link', { name: 'Install' })).toHaveAttribute(
      'aria-current',
      'location'
    )

    target.remove()
  })

  it('does not navigate for a disabled section', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true })

    render(<Anchor items={items} />)
    const link = screen.getByRole('link', { name: 'API' })

    // A disabled item is still a link — it just refuses to move the page.
    expect(link).toHaveAttribute('aria-disabled', 'true')
    await user.click(link)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('names the navigation landmark', () => {
    render(<Anchor items={items} label="On this page" />)

    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
  })
})
