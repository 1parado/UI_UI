import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NativeSelect } from './NativeSelect'

describe('NativeSelect', () => {
  it('renders the options and reports the choice', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <NativeSelect aria-label="Plan" defaultValue="free" onChange={onChange}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </NativeSelect>
    )

    const select = screen.getByRole('combobox', { name: 'Plan' })
    expect(select).toHaveValue('free')

    await user.selectOptions(select, 'pro')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(select).toHaveValue('pro')
  })

  it('renders groups and disabled options', () => {
    render(
      <NativeSelect aria-label="Region" defaultValue="eu">
        <optgroup label="Europe">
          <option value="eu">European Union</option>
          <option value="uk">United Kingdom</option>
        </optgroup>
        <option value="us" disabled>
          United States
        </option>
      </NativeSelect>
    )

    expect(screen.getByRole('group', { name: 'Europe' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'United States' })).toBeDisabled()
  })

  it('marks itself invalid for assistive tech', () => {
    render(<NativeSelect aria-label="Plan" invalid />)

    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('lets an explicit aria-invalid win over the prop', () => {
    render(<NativeSelect aria-label="Plan" invalid aria-invalid={false} />)

    expect(screen.getByRole('combobox', { name: 'Plan' })).not.toHaveAttribute('aria-invalid')
  })

  it('keeps the real DOM size attribute usable', () => {
    // The variant is `selectSize` precisely so `size={4}` still means "show
    // four rows" rather than being shadowed by a style variant.
    render(<NativeSelect aria-label="Plan" size={4} selectSize="sm" multiple />)

    expect(screen.getByRole('listbox', { name: 'Plan' })).toHaveAttribute('size', '4')
  })

  it('splits className from containerClassName', () => {
    const { container } = render(
      <NativeSelect aria-label="Plan" className="w-40" containerClassName="max-w-xs" />
    )

    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveClass('w-40')
    expect(container.firstElementChild).toHaveClass('max-w-xs')
  })

  it('is disabled as a whole', () => {
    render(<NativeSelect aria-label="Plan" disabled />)

    expect(screen.getByRole('combobox', { name: 'Plan' })).toBeDisabled()
  })
})
