import type { Meta, StoryObj } from '@storybook/react'
import { Bubble, BubbleGroup } from './Bubble'

const meta = {
  title: 'Components/Bubble',
  component: Bubble,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The bubble shell of a chat turn — compact, side-aligned, with delivery state. Sits below `Message`, which is the document treatment: avatar, role, markdown, tool calls.',
      },
    },
  },
  args: { children: 'On my way — two minutes' },
} satisfies Meta<typeof Bubble>

export default meta
type Story = StoryObj<typeof meta>

export const Incoming: Story = {
  render: (args) => (
    <div className="w-[420px]">
      <Bubble {...args} side="in" tail />
    </div>
  ),
}

export const Outgoing: Story = {
  render: () => (
    <div className="w-[420px]">
      <Bubble side="out" tail>
        Running late, start without me
      </Bubble>
    </div>
  ),
}

export const Statuses: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-2">
      <Bubble side="out" status="sending" meta="09:20">
        Sending…
      </Bubble>
      <Bubble side="out" status="sent" meta="09:20">
        Sent
      </Bubble>
      <Bubble side="out" status="read" meta="09:21">
        Read
      </Bubble>
      <Bubble side="out" status="error" meta="Not delivered">
        Tap to retry
      </Bubble>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-2">
      <Bubble size="sm">Small — for dense threads</Bubble>
      <Bubble>Default</Bubble>
      <Bubble size="lg">Large — a heading-level line</Bubble>
    </div>
  ),
}

/** Only the last bubble of a run points, the way a real thread reads. */
export const Grouped: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-4">
      <BubbleGroup side="in">
        <Bubble side="in" meta="09:18">
          Did you see the deploy?
        </Bubble>
        <Bubble side="in" tail meta="09:18">
          It went green
        </Bubble>
      </BubbleGroup>
      <BubbleGroup side="out">
        <Bubble side="out" tail status="read" meta="09:21">
          Nice — shipping the docs now
        </Bubble>
      </BubbleGroup>
    </div>
  ),
}

export const LongText: Story = {
  render: () => (
    <div className="w-[420px]">
      <Bubble side="in" tail>
        {Array.from({ length: 6 })
          .map((_, index) => `Paragraph ${index + 1} of a longer reply that wraps.`)
          .join(' ')}
      </Bubble>
    </div>
  ),
}

/** Where it belongs: a small widget, not a full conversation view. */
export const InAWidget: Story = {
  render: () => (
    <div className="w-[360px] rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium">Support</p>
      <div className="flex flex-col gap-4">
        <BubbleGroup side="in">
          <Bubble side="in" tail size="sm">
            How can I help?
          </Bubble>
        </BubbleGroup>
        <BubbleGroup side="out">
          <Bubble side="out" tail size="sm" status="read">
            The invoice export is empty
          </Bubble>
        </BubbleGroup>
      </div>
    </div>
  ),
}
