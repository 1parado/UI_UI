import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTimePicker, TimeColumns, TimePicker } from './TimePicker'

const trigger = (name = 'Time') => screen.getByRole('button', { name })
const hours = () => within(screen.getByRole('listbox', { name: 'Hour' }))
const minutes = () => within(screen.getByRole('listbox', { name: 'Minute' }))

describe('TimePicker', () => {
  it('shows the value on the trigger', () => {
    render(<TimePicker defaultValue="09:30" />)

    expect(trigger()).toHaveTextContent('09:30')
  })

  it('shows the placeholder when empty', () => {
    render(<TimePicker />)

    expect(trigger()).toHaveTextContent('Pick a time')
  })

  it('offers every hour and every minute by default', async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="09:30" />)

    await user.click(trigger())

    expect(await screen.findByRole('listbox', { name: 'Hour' })).toBeInTheDocument()
    expect(hours().getAllByRole('option')).toHaveLength(24)
    expect(minutes().getAllByRole('option')).toHaveLength(60)
  })

  it('marks the selected hour and minute', async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="09:30" />)

    await user.click(trigger())

    expect(hours().getByRole('option', { name: '09' })).toHaveAttribute('aria-selected', 'true')
    expect(minutes().getByRole('option', { name: '30' })).toHaveAttribute('aria-selected', 'true')
  })

  it('picks an hour and leaves the minute alone', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="09:30" onValueChange={onValueChange} />)

    await user.click(trigger())
    await user.click(hours().getByRole('option', { name: '14' }))

    expect(onValueChange).toHaveBeenCalledWith('14:30')
  })

  it('picks a minute and leaves the hour alone', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="09:30" onValueChange={onValueChange} />)

    await user.click(trigger())
    await user.click(minutes().getByRole('option', { name: '05' }))

    expect(onValueChange).toHaveBeenCalledWith('09:05')
  })

  it('respects the minute step', async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="09:30" minuteStep={15} />)

    await user.click(trigger())

    expect(minutes().getAllByRole('option').map((option) => option.textContent)).toEqual([
      '00',
      '15',
      '30',
      '45',
    ])
  })

  it('formats a 12-hour clock without changing the value', async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="14:45" hourCycle={12} />)

    expect(trigger()).toHaveTextContent('2:45 PM')

    await user.click(trigger())
    await user.click(within(screen.getByRole('listbox', { name: 'AM / PM' })).getByRole('option', { name: 'AM' }))

    expect(trigger()).toHaveTextContent('2:45 AM')
  })

  it('runs a 12-hour clock from 12 rather than 0', async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="00:15" hourCycle={12} />)

    expect(trigger()).toHaveTextContent('12:15 AM')

    await user.click(trigger())

    // No "0" on a 12-hour dial; midnight is twelve.
    const options = hours()
      .getAllByRole('option')
      .map((option) => option.textContent)
    expect(options[0]).toBe('12')
    expect(options).not.toContain('0')
    expect(options).toHaveLength(12)
  })

  it('renders a native time field when asked', () => {
    render(<TimePicker defaultValue="18:00" native aria-label="Starts at" />)

    expect(screen.getByLabelText('Starts at')).toHaveValue('18:00')
  })

  it('submits with the surrounding form', () => {
    const { container } = render(<TimePicker defaultValue="07:45" name="starts" />)

    expect(container.querySelector('input[name="starts"]')).toHaveValue('07:45')
  })
})

describe('TimeColumns', () => {
  it('stands on its own without a trigger', () => {
    render(<TimeColumns value="08:00" minuteStep={5} />)

    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument()
    expect(minutes().getAllByRole('option')).toHaveLength(12)
  })

  it('takes localised column names', () => {
    render(<TimeColumns value="08:00" hourCycle={12} labels={{ hour: '时', minute: '分', am: '上午', pm: '下午' }} />)

    expect(screen.getByRole('listbox', { name: '时' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: '分' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: '上午 / 下午' })).toBeInTheDocument()
  })
})

describe('DateTimePicker', () => {
  it('shows the date and the time together', () => {
    render(<DateTimePicker defaultValue="2026-09-17T09:30" />)

    expect(trigger('Date and time')).toHaveTextContent('9:30')
  })

  it('shows the placeholder when empty', () => {
    render(<DateTimePicker />)

    expect(trigger('Date and time')).toHaveTextContent('Pick a date and time')
  })

  it('changes the time without touching the date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker defaultValue="2026-09-17T09:30" onValueChange={onValueChange} />)

    await user.click(trigger('Date and time'))
    await user.click(hours().getByRole('option', { name: '11' }))

    expect(onValueChange).toHaveBeenCalledWith('2026-09-17T11:30')
  })

  it('changes the date without touching the time', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker defaultValue="2026-09-17T09:30" onValueChange={onValueChange} />)

    await user.click(trigger('Date and time'))
    // Both the cell and its button carry `data-day`; the button is the target.
    const day = await screen.findByRole('button', { name: /22/ })
    const target = day.ownerDocument.querySelector<HTMLButtonElement>('button[data-day="2026-09-22"]')
    await user.click(target!)

    expect(onValueChange).toHaveBeenCalledWith('2026-09-22T09:30')
  })

  it('opens the calendar on the month of the current value', async () => {
    const user = userEvent.setup()
    render(<DateTimePicker defaultValue="2026-03-04T08:00" />)

    await user.click(trigger('Date and time'))

    expect(await screen.findByText('March 2026')).toBeInTheDocument()
  })

  it('renders a native field when asked', () => {
    render(<DateTimePicker defaultValue="2026-09-17T09:30" native aria-label="When" />)

    expect(screen.getByLabelText('When')).toHaveValue('2026-09-17T09:30')
  })
})
