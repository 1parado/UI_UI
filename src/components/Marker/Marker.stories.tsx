import type { Meta, StoryObj } from '@storybook/react'
import { Marker } from './Marker'

const meta = {
  title: 'Components/Marker',
  component: Marker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A break in a stream — a date divider, an unread boundary, a session start. `role="separator"` is what makes it a boundary rather than decoration.',
      },
    },
  },
  args: { children: 'Today' },
} satisfies Meta<typeof Marker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="w-[420px]">
      <Marker {...args} />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Marker tone="muted">Yesterday</Marker>
      <Marker tone="primary">New messages</Marker>
      <Marker tone="success">Deploy succeeded</Marker>
      <Marker tone="destructive">Connection lost</Marker>
    </div>
  ),
}

export const Pill: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Marker variant="pill">Session started</Marker>
      <Marker variant="pill" tone="primary">
        New messages
      </Marker>
    </div>
  ),
}

export const Dashed: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <Marker variant="dot" />
      <Marker variant="dot" tone="destructive" />
      <Marker variant="dot" tone="primary" />
    </div>
  ),
}

/** Where it earns its keep: a date break inside a message stream. */
export const InAStream: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-3 text-sm">
      <p className="rounded-md bg-muted p-2">Are we still on for Thursday?</p>
      <Marker variant="pill">Today</Marker>
      <p className="ml-auto w-fit rounded-md bg-primary p-2 text-primary-foreground">
        Yes — 14:00 works
      </p>
      <Marker tone="primary">New messages</Marker>
      <p className="rounded-md bg-muted p-2">Added it to the calendar.</p>
    </div>
  ),
}
