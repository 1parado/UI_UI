import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from './Calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Calendar>

const Single = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={date}
      footer={date ? `Selected ${date.toDateString()}` : 'Pick a day'}
    />
  )
}

export const Default: Story = {
  render: () => <Single />,
}

const Range = () => {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 8, 8),
    to: new Date(2026, 8, 12),
  })
  return <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
}

/** `mode="range"` draws the span as one continuous band. */
export const DateRangeSelection: Story = {
  render: () => <Range />,
}

const Multiple = () => {
  const [days, setDays] = React.useState<Date[] | undefined>([
    new Date(2026, 8, 3),
    new Date(2026, 8, 9),
  ])
  return <Calendar mode="multiple" selected={days} onSelect={setDays} />
}

export const MultipleDays: Story = {
  render: () => <Multiple />,
}

const WeekendsBlocked = () => {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={{ dayOfWeek: [0, 6] }}
      defaultMonth={new Date(2026, 8, 1)}
    />
  )
}

/** `disabled` takes any react-day-picker matcher, e.g. weekends or a window. */
export const DisabledDays: Story = {
  render: () => <WeekendsBlocked />,
}

export const WithMonthDropdown: Story = {
  render: () => (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={new Date(2026, 8, 1)}
      startMonth={new Date(2024, 0)}
      endMonth={new Date(2028, 11)}
    />
  ),
}

export const TwoMonths: Story = {
  render: () => (
    <Calendar mode="single" numberOfMonths={2} defaultMonth={new Date(2026, 8, 1)} />
  ),
}
