import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar } from './Calendar'

const SEPTEMBER_2026 = new Date(2026, 8, 1)

// Both the day cell and its button carry `data-day`; the button is the
// interactive one, so always select it explicitly.
const day = (container: HTMLElement, isoDate: string) =>
  container.querySelector<HTMLButtonElement>(`button[data-day="${isoDate}"]`)

describe('Calendar', () => {
  it('renders the month it is pointed at', () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={SEPTEMBER_2026} />
    )

    expect(screen.getByText('September 2026')).toBeInTheDocument()
    // The weekday row is presentational (`<thead aria-hidden>`), so count cells
    // rather than query by role.
    expect(container.querySelectorAll('thead th')).toHaveLength(7)
  })

  it('reports the clicked day', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { container } = render(
      <Calendar mode="single" defaultMonth={SEPTEMBER_2026} onSelect={onSelect} />
    )

    await user.click(day(container, '2026-09-15')!)

    expect(onSelect).toHaveBeenCalledTimes(1)
    const picked = onSelect.mock.calls[0][0] as Date
    expect(picked.getFullYear()).toBe(2026)
    expect(picked.getMonth()).toBe(8)
    expect(picked.getDate()).toBe(15)
  })

  it('marks the selected day on its cell', () => {
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={SEPTEMBER_2026}
        selected={new Date(2026, 8, 9)}
      />
    )

    const cell = day(container, '2026-09-09')!.closest('td')!
    expect(cell).toHaveAttribute('aria-selected', 'true')
    expect(cell).toHaveAttribute('data-selected')
  })

  it('refuses days excluded by a matcher', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={SEPTEMBER_2026}
        disabled={{ dayOfWeek: [0, 6] }}
        onSelect={onSelect}
      />
    )

    // 2026-09-12 is a Saturday.
    expect(day(container, '2026-09-12')!).toBeDisabled()

    await user.click(day(container, '2026-09-12')!)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows outside days on the same grid', () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={SEPTEMBER_2026} showOutsideDays />
    )

    expect(day(container, '2026-08-31')!.closest('td')).toHaveAttribute('data-outside')
  })

  it('hides outside days when asked', () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={SEPTEMBER_2026} showOutsideDays={false} />
    )

    // Hidden days keep their cell for the grid but lose the button entirely.
    expect(day(container, '2026-08-31')).toBeNull()
    expect(container.querySelector('td[data-day="2026-08-31"]')).toHaveAttribute(
      'data-hidden'
    )
  })

  it('wires the range band across the selected span', () => {
    const { container } = render(
      <Calendar
        mode="range"
        defaultMonth={SEPTEMBER_2026}
        selected={{ from: new Date(2026, 8, 8), to: new Date(2026, 8, 12) }}
      />
    )

    expect(day(container, '2026-09-08')).toHaveAttribute('data-range-start')
    expect(day(container, '2026-09-10')).toHaveAttribute('data-range-middle')
    expect(day(container, '2026-09-12')).toHaveAttribute('data-range-end')
  })

  it('moves focus with the arrow keys', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Calendar mode="single" defaultMonth={SEPTEMBER_2026} selected={new Date(2026, 8, 9)} />
    )

    day(container, '2026-09-09')!.focus()
    await user.keyboard('{ArrowRight}')

    expect(day(container, '2026-09-10')!).toHaveFocus()
  })

  it('walks months with the nav buttons', async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" defaultMonth={SEPTEMBER_2026} />)

    await user.click(screen.getByRole('button', { name: /next month/i }))
    expect(screen.getByText('October 2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /previous month/i }))
    expect(screen.getByText('September 2026')).toBeInTheDocument()
  })

  it('renders a month dropdown when captionLayout asks for one', () => {
    render(
      <Calendar
        mode="single"
        captionLayout="dropdown"
        defaultMonth={SEPTEMBER_2026}
        startMonth={new Date(2026, 0)}
        endMonth={new Date(2026, 11)}
      />
    )

    // Two selects: month and year.
    const [months] = screen.getAllByRole('combobox')
    expect(within(months).getByRole('option', { name: 'September' })).toBeInTheDocument()
  })
})
