import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { DateRange } from 'react-day-picker'
import { DatePicker, DateRangePicker } from './DatePicker'

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DatePicker>

const Controlled = ({ initial }: { initial?: Date }) => {
  const [date, setDate] = React.useState<Date | undefined>(initial)
  return (
    <div className="flex flex-col items-start gap-3">
      <DatePicker value={date} onValueChange={setDate} />
      <p className="text-sm text-muted-foreground">
        {date ? date.toDateString() : 'No date selected'}
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const WithValue: Story = {
  render: () => <Controlled initial={new Date(2026, 8, 16)} />,
}

export const CustomFormat: Story = {
  render: () => <CustomFormatDemo />,
}

const CustomFormatDemo = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 16))
  return (
    <DatePicker
      value={date}
      onValueChange={setDate}
      formatDate={(value) =>
        value.toLocaleDateString('en-CA') // YYYY-MM-DD
      }
    />
  )
}

const BlockedDates = () => {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <DatePicker
      value={date}
      onValueChange={setDate}
      placeholder="Weekdays only"
      disabledDays={{ dayOfWeek: [0, 6] }}
    />
  )
}

/** Any react-day-picker matcher works: weekdays only here. */
export const DisabledDays: Story = {
  render: () => <BlockedDates />,
}

const WithoutClear = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 16))
  return <DatePicker value={date} onValueChange={setDate} clearable={false} />
}

export const NotClearable: Story = {
  render: () => <WithoutClear />,
}

export const Disabled: Story = {
  render: () => <DatePicker disabled placeholder="Unavailable" />,
}

const RangeDemo = () => {
  const [range, setRange] = React.useState<DateRange | undefined>()
  return (
    <div className="flex flex-col items-start gap-3">
      <DateRangePicker value={range} onValueChange={setRange} />
      <p className="text-sm text-muted-foreground">
        {range?.from && range.to
          ? `${range.from.toDateString()} → ${range.to.toDateString()}`
          : 'No range selected'}
      </p>
    </div>
  )
}

/** `DateRangePicker` reports `{ from, to }`, and closes once both ends are set. */
export const Range: Story = {
  render: () => <RangeDemo />,
}

export const SingleMonthRange: Story = {
  render: () => <DateRangePicker numberOfMonths={1} />,
}
