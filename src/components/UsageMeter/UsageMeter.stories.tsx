import type { Meta, StoryObj } from '@storybook/react'
import { UsageMeter } from './UsageMeter'

const meta: Meta<typeof UsageMeter> = {
  title: 'Components/UsageMeter',
  component: UsageMeter,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UsageMeter>

export const Tokens: Story = {
  args: { label: 'Tokens', used: 12400, max: 50000 },
}

export const NearLimit: Story = {
  args: { label: 'Tokens', used: 43000, max: 50000 },
}

export const OverLimit: Story = {
  args: { label: 'Tokens', used: 52000, max: 50000 },
}

export const Unlimited: Story = {
  args: { label: 'Tokens', used: 1843200 },
}

export const Cost: Story = {
  args: {
    label: 'Spend this month',
    used: 4.82,
    max: 20,
    format: (used, max) =>
      `$${used.toFixed(2)}${max === undefined ? '' : ` / $${max.toFixed(2)}`}`,
  },
}

export const Stacked: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <UsageMeter label="Tokens" used={12400} max={50000} />
      <UsageMeter
        label="Spend this month"
        used={4.82}
        max={20}
        format={(used, max) =>
          `$${used.toFixed(2)}${max === undefined ? '' : ` / $${max.toFixed(2)}`}`
        }
      />
      <UsageMeter label="Requests" used={1843200} />
    </div>
  ),
}
