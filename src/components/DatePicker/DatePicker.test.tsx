import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DateRange } from 'react-day-picker'
import { DatePicker, DateRangePicker } from './DatePicker'

const SEPTEMBER_2026 = new Date(2026, 8, 1)

/**
 * Local-time YYYY-MM-DD. `toISOString()` would shift the day for anyone east of
 * UTC, which is exactly the kind of flake this suite does not need.
 */
const iso = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

const pickDay = (isoDate: string) =>
  document.querySelector<HTMLButtonElement>(`button[data-day="${isoDate}"]`)!

describe('DatePicker', () => {
  it('shows the placeholder until a date is chosen', () => {
    render(<DatePicker />)

    expect(screen.getByRole('button', { name: /pick a date/i })).toBeInTheDocument()
  })

  it('opens a dialog calendar and reports the picked day', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker onValueChange={onValueChange} defaultMonth={SEPTEMBER_2026} />
    )

    await user.click(screen.getByRole('button', { name: /pick a date/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(pickDay('2026-09-15'))

    const picked = onValueChange.mock.calls[0][0] as Date
    expect(iso(picked)).toBe('2026-09-15')
  })

  it('formats the value with the supplied formatter', () => {
    render(<DatePicker value={new Date(2026, 8, 16)} formatDate={iso} />)

    expect(screen.getByRole('button', { name: /2026-09-16/ })).toBeInTheDocument()
  })

  it('clears the value without opening the popover', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DatePicker value={new Date(2026, 8, 16)} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Clear date' }))

    expect(onValueChange).toHaveBeenCalledWith(undefined)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hides the clear button when told to, and when there is nothing to clear', () => {
    const { rerender } = render(
      <DatePicker value={new Date(2026, 8, 16)} clearable={false} />
    )
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument()

    rerender(<DatePicker />)
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument()
  })

  it('blocks days rejected by the matcher', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker
        value={new Date(2026, 8, 16)}
        formatDate={iso}
        disabledDays={{ dayOfWeek: [0, 6] }}
      />
    )

    await user.click(screen.getByRole('button', { name: /2026-09-16/ }))

    // 2026-09-12 is a Saturday.
    expect(pickDay('2026-09-12')).toBeDisabled()
    expect(pickDay('2026-09-14')).not.toBeDisabled()
  })

  it('opens on the month of the current value', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={new Date(2026, 3, 20)} formatDate={iso} />)

    await user.click(screen.getByRole('button', { name: /2026-04-20/ }))
    expect(screen.getByText('April 2026')).toBeInTheDocument()
  })

  it('does not open while disabled', async () => {
    const user = userEvent.setup()
    render(<DatePicker disabled placeholder="Unavailable" />)

    await user.click(screen.getByRole('button', { name: /unavailable/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

/**
 * `DateRangePicker` is controlled, so the range has to be fed back in — without
 * it react-day-picker sees an empty selection on every click and treats each one
 * as the start of a new range.
 */
const RangeHarness = ({
  onValueChange,
}: {
  onValueChange?: (range: DateRange | undefined) => void
}) => {
  const [range, setRange] = React.useState<DateRange | undefined>()
  return (
    <DateRangePicker
      value={range}
      numberOfMonths={1}
      defaultMonth={SEPTEMBER_2026}
      onValueChange={(next) => {
        setRange(next)
        onValueChange?.(next)
      }}
    />
  )
}

describe('DateRangePicker', () => {
  it('labels the trigger with the two ends of the range', () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 8, 8), to: new Date(2026, 8, 12) }}
        formatDate={iso}
      />
    )

    expect(
      screen.getByRole('button', { name: /2026-09-08.*2026-09-12/ })
    ).toBeInTheDocument()
  })

  it('shows a single date while the range is still open', () => {
    render(<DateRangePicker value={{ from: new Date(2026, 8, 8) }} formatDate={iso} />)

    expect(screen.getByRole('button', { name: /2026-09-08/ })).toBeInTheDocument()
  })

  it('keeps the popover open until the range is closed off', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<RangeHarness onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: /pick a date range/i }))
    await user.click(pickDay('2026-09-08'))

    // react-day-picker answers the first click with `{ from, to: from }` — a
    // one-day range that is not yet finished, so the picker stays open.
    expect(onValueChange).toHaveBeenCalledTimes(1)
    const first = onValueChange.mock.calls[0][0] as { from: Date; to?: Date }
    expect(iso(first.from)).toBe('2026-09-08')
    expect(first.to && iso(first.to)).toBe('2026-09-08')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('completes the range on the second click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<RangeHarness onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: /pick a date range/i }))
    await user.click(pickDay('2026-09-08'))
    await user.click(pickDay('2026-09-12'))

    const calls = onValueChange.mock.calls
    const last = calls[calls.length - 1]![0] as { from: Date; to: Date }
    expect(iso(last.from)).toBe('2026-09-08')
    expect(iso(last.to)).toBe('2026-09-12')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a single date for a one-day range', () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 8, 8), to: new Date(2026, 8, 8) }}
        formatDate={iso}
      />
    )

    expect(screen.getByRole('button', { name: /^2026-09-08$/ })).toBeInTheDocument()
  })

  it('clears the range', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 8, 8), to: new Date(2026, 8, 12) }}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Clear date range' }))
    expect(onValueChange).toHaveBeenCalledWith(undefined)
  })
})
