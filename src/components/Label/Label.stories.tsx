import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './Label'

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Email address',
  },
}

export const WithInput: Story = {
  render: (args) => (
    <div className="grid w-[300px] gap-1.5">
      <Label htmlFor="demo-email" {...args}>
        Email
      </Label>
      <input
        id="demo-email"
        type="email"
        placeholder="you@example.com"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  ),
}

export const WithDisabledInput: Story = {
  render: (args) => (
    <div className="grid w-[300px] gap-1.5">
      <Label htmlFor="demo-disabled" {...args}>
        Username
      </Label>
      <input
        id="demo-disabled"
        disabled
        placeholder="Disabled input"
        className="peer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50"
      />
    </div>
  ),
}
