import type { Meta, StoryObj } from '@storybook/react'
import { Tour } from './Tour'
import type { TourStep } from './Tour'
import { Button } from '@/components/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/Card'

const steps: TourStep[] = [
  {
    target: '#composer',
    title: 'Write here',
    content: 'Drafts save themselves, so nothing you type here can be lost.',
    placement: 'bottom',
  },
  {
    target: '#model',
    title: 'Pick a model',
    content: 'Switch models mid-thread — the history is kept either way.',
    placement: 'right',
  },
  {
    target: '#run',
    title: 'Send it',
    content: 'Enter sends. Shift+Enter starts a new line.',
    placement: 'left',
  },
]

function Stage() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Agent console</CardTitle>
        <CardDescription>The three controls this tour walks through.</CardDescription>
      </CardHeader>
      <div className="space-y-3 p-6 pt-0">
        <textarea
          id="composer"
          rows={3}
          placeholder="Ask about your codebase…"
          className="w-full rounded-md border border-input bg-background p-3 text-sm"
        />
        <div className="flex items-center gap-3">
          <select id="model" className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option>Fast</option>
            <option>Balanced</option>
            <option>Careful</option>
          </select>
          <Button id="run">Run</Button>
        </div>
      </div>
    </Card>
  )
}

const meta = {
  title: 'Components/Tour',
  component: Tour,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A walk through the page, one element at a time. The target is *pointed at* — everything else is covered by four dark bands rather than one cut-out shape, so tapping away has something to tap — and the card goes on whichever side has room, flipping instead of hanging off the screen. A step whose target has gone missing is centred rather than skipped: dropping it silently leaves its author wondering where it went.',
      },
    },
  },
  args: {
    steps,
    defaultOpen: true,
  },
  argTypes: {
    spotlightPadding: { control: { type: 'range', min: 0, max: 32, step: 4 } },
  },
} satisfies Meta<typeof Tour>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="flex justify-center p-6">
      <Stage />
      <Tour {...args} steps={steps} />
    </div>
  ),
}

export const NoMaskDismiss: Story = {
  render: (args) => (
    <div className="flex justify-center p-6">
      <Stage />
      <Tour {...args} steps={steps} closeOnMaskClick={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'For onboarding that should not end just because someone clicked the wrong spot.',
      },
    },
  },
}

export const TightSpotlight: Story = {
  render: (args) => (
    <div className="flex justify-center p-6">
      <Stage />
      <Tour {...args} steps={steps} spotlightPadding={2} />
    </div>
  ),
}

export const CustomLabels: Story = {
  render: (args) => (
    <div className="flex justify-center p-6">
      <Stage />
      <Tour
        {...args}
        steps={steps}
        nextLabel="Continue"
        prevLabel="Previous"
        finishLabel="Start writing"
      />
    </div>
  ),
}
