import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BackTop, FloatButton, FloatButtonGroup } from './FloatButton'

const setScrollY = (value: number) =>
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true })

afterEach(() => {
  setScrollY(0)
})

describe('FloatButton', () => {
  it('is a button with an accessible name', () => {
    render(<FloatButton label="New" />)

    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })

  it('falls back to the tooltip when there is no label', () => {
    render(<FloatButton tooltip="Create document" />)

    expect(screen.getByRole('button', { name: 'Create document' })).toBeInTheDocument()
  })

  it('pins itself to a corner when it is on its own', () => {
    render(<FloatButton label="New" position="bottom-left" />)

    expect(screen.getByRole('button')).toHaveClass('fixed', 'bottom-6', 'left-6')
  })

  it('does not pin itself inside a group', () => {
    render(
      <FloatButtonGroup>
        <FloatButton label="New" />
      </FloatButtonGroup>
    )

    expect(screen.getByRole('button', { name: 'New' })).not.toHaveClass('fixed')
  })

  it('acts like any other button', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<FloatButton label="New" onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('FloatButtonGroup', () => {
  it('renders its children in the corner the group owns', () => {
    render(
      <FloatButtonGroup position="top-right">
        <FloatButton label="One" />
        <FloatButton label="Two" />
      </FloatButtonGroup>
    )

    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument()
  })

  it('hides the stack behind a trigger until it is clicked', async () => {
    const user = userEvent.setup()
    render(
      <FloatButtonGroup trigger="click" label="More actions">
        <FloatButton label="One" />
      </FloatButtonGroup>
    )

    expect(screen.queryByRole('button', { name: 'One' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
  })
})

describe('BackTop', () => {
  it('stays out of the way at the top of the page', () => {
    setScrollY(0)
    render(<BackTop />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('is absent from the tab order while it is hidden', () => {
    setScrollY(0)
    const { container } = render(<BackTop />)

    // Not merely faded out: a keyboard user should not land on nothing.
    expect(container.querySelector('button')).toBeNull()
  })

  it('appears once the page has scrolled and scrolls back on click', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true })

    setScrollY(400)
    render(<BackTop visibilityHeight={200} />)

    const button = screen.getByRole('button', { name: 'Back to top' })
    await user.click(button)

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('uses the threshold it was given', () => {
    setScrollY(150)
    const { unmount } = render(<BackTop visibilityHeight={200} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    unmount()
    setScrollY(250)
    render(<BackTop visibilityHeight={200} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
