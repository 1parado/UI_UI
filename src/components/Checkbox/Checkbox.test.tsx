import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders as role=checkbox, unchecked by default', () => {
    render(<Checkbox aria-label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles with the Space key', async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Accept terms" />)
    const checkbox = screen.getByRole('checkbox')

    checkbox.focus()
    await user.keyboard(' ')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('exposes indeterminate state to assistive tech', () => {
    render(<Checkbox aria-label="Select all" checked="indeterminate" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed'
    )
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    render(<Checkbox aria-label="Accept terms" disabled />)
    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toBeDisabled()
    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })
})
