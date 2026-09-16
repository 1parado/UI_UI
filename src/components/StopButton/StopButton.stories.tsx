import type { Meta, StoryObj } from '@storybook/react'
import { StopButton } from './StopButton'

const meta: Meta<typeof StopButton> = {
  title: 'Components/StopButton',
  component: StopButton,
  tags: ['autodocs'],
  args: { onClick: () => undefined },
}

export default meta
type Story = StoryObj<typeof StopButton>

export const IconOnly: Story = {}

export const WithLabel: Story = {
  args: { label: 'Stop' },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const InComposer: Story = {
  render: () => (
    <div className="flex w-[32rem] items-end gap-2 rounded-lg border border-input bg-background p-2">
      <p className="min-h-[44px] flex-1 py-2.5 text-sm leading-relaxed">
        The retry fires before the refresh settles, so the request keeps going out
        with an expired token
      </p>
      <StopButton />
    </div>
  ),
}
