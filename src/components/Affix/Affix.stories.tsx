import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Affix } from './Affix'

const meta = {
  title: 'Components/Affix',
  component: Affix,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pins its child once the page scrolls past it. The wrapper **keeps the child box** while it is pinned, so the layout around it does not jump. Reach for `position: sticky` first — `Affix` is for what sticky cannot do: a scroll container that is not the parent, or a pin that only engages after a threshold.',
      },
    },
  },
  args: { offsetTop: 0, children: <span className="text-sm">Pinned content</span> },
} satisfies Meta<typeof Affix>

export default meta
type Story = StoryObj<typeof meta>

const filler = Array.from({ length: 12 }, (_, index) => (
  <p key={index} className="mb-4 text-sm text-muted-foreground">
    Paragraph {index + 1}. Scroll the frame — the bar detaches at the top and the
    text below it does not move up to fill the gap.
  </p>
))

const ScrollFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[420px] w-[560px] overflow-y-auto rounded-lg border border-border p-4">
    {children}
  </div>
)

export const InAScrollContainer: Story = {
  render: (args) => (
    <ScrollFrame>
      {filler.slice(0, 2)}
      <Affix {...args} target={() => document.querySelector<HTMLElement>('[data-affix-frame]')}>
        <div className="rounded-md border border-border bg-card px-4 py-2 shadow-sm">
          <strong className="text-sm">Toolbar</strong>
        </div>
      </Affix>
      {filler}
    </ScrollFrame>
  ),
}

export const WithAnOffset: Story = {
  args: { offsetTop: 24 },
  render: (args) => (
    <ScrollFrame>
      {filler.slice(0, 2)}
      <Affix {...args}>
        <div className="rounded-md border border-border bg-card px-4 py-2 shadow-sm">
          <strong className="text-sm">24px from the top</strong>
        </div>
      </Affix>
      {filler}
    </ScrollFrame>
  ),
}

/** Pinned to the bottom instead — for a bar that should always be reachable. */
export const PinnedToTheBottom: Story = {
  args: { offsetBottom: 16 },
  render: (args) => (
    <ScrollFrame>
      {filler}
      <Affix {...args}>
        <div className="rounded-md border border-border bg-card px-4 py-2 shadow-sm">
          <strong className="text-sm">Bottom bar</strong>
        </div>
      </Affix>
    </ScrollFrame>
  ),
}

const ChangeDemo = () => {
  const [pinned, setPinned] = React.useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {pinned ? 'Pinned — the bar is out of the flow.' : 'In flow.'}
      </p>
      <ScrollFrame>
        {filler.slice(0, 2)}
        <Affix offsetTop={0} onChange={setPinned}>
          <div className="rounded-md border border-border bg-card px-4 py-2 shadow-sm">
            <strong className="text-sm">Watch the label</strong>
          </div>
        </Affix>
        {filler}
      </ScrollFrame>
    </div>
  )
}

export const ReportingTheChange: Story = { render: () => <ChangeDemo /> }
