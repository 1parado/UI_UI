import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders as role=switch, unchecked by default', () => {
    render(<Switch aria-label="Notifications" />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
    expect(sw).not.toBeDisabled()
  })

  it('toggles on click (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="Notifications" />)
    const sw = screen.getByRole('switch')

    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles with the Space key', async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="Notifications" />)
    const sw = screen.getByRole('switch')

    sw.focus()
    await user.keyboard(' ')
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('respects defaultChecked', () => {
    render(<Switch aria-label="Notifications" defaultChecked />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onCheckedChange with the next value', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Notifications"
      />
    )

    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    render(<Switch aria-label="Notifications" disabled />)
    const sw = screen.getByRole('switch')

    expect(sw).toBeDisabled()
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })
})
