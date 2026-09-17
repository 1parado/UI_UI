import type { Meta, StoryObj } from '@storybook/react'
import { DateTimePicker, TimeColumns, TimePicker } from './TimePicker'

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TimePicker>

export const Default: Story = {
  args: {
    defaultValue: '09:30',
  },
}

export const Empty: Story = {
  args: {},
}

/** A 12-hour clock is display only — the value stays `HH:mm`. */
export const TwelveHour: Story = {
  args: {
    defaultValue: '14:45',
    hourCycle: 12,
  },
}

/** Five-minute granularity, the usual choice for a scheduling form. */
export const MinuteStep: Story = {
  args: {
    defaultValue: '10:15',
    minuteStep: 15,
  },
}

export const Native: Story = {
  args: {
    defaultValue: '18:00',
    native: true,
  },
}

const ColumnsExample = () => (
  <div className="inline-flex rounded-lg border border-border p-3">
    <TimeColumns value="08:00" minuteStep={5} />
  </div>
)

/**
 * `TimeColumns` is the panel on its own, for when the clock is one field in a
 * larger form rather than the whole popover.
 */
export const Columns: Story = {
  render: () => <ColumnsExample />,
}

export const DateTime: Story = {
  render: () => (
    <DateTimePicker
      defaultValue="2026-09-17T09:30"
      minuteStep={15}
      aria-label="Scheduled at"
    />
  ),
}

export const DateTimeNative: Story = {
  render: () => <DateTimePicker defaultValue="2026-09-17T09:30" native />,
}

/** Weekends blocked, the way a business-hours form would set it up. */
export const DateTimeWeekdaysOnly: Story = {
  render: () => (
    <DateTimePicker
      defaultValue="2026-09-17T09:00"
      minuteStep={30}
      disabledDays={{ dayOfWeek: [0, 6] }}
    />
  ),
}
