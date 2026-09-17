import type { Meta, StoryObj } from '@storybook/react'
import { Sparkline } from './Sparkline'

const meta: Meta<typeof Sparkline> = {
  title: 'Components/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Sparkline>

export const Default: Story = {
  args: {
    data: [12, 18, 15, 22, 31, 28, 34],
    className: 'w-[160px]',
    label: 'Requests over the last seven days',
  },
}

export const Area: Story = {
  args: {
    data: [12, 18, 15, 22, 31, 28, 34],
    area: true,
    className: 'w-[160px] text-success',
    label: 'Tokens used per day',
  },
}

/** A rule at the final value reads as "you are here". */
export const WithLastLine: Story = {
  args: {
    data: [40, 52, 48, 61, 55, 70, 84],
    area: true,
    showLastLine: true,
    className: 'w-[180px]',
    label: 'Latency trend',
  },
}

/** Floats either side of a fixed baseline instead of being normalised to itself. */
export const FixedScale: Story = {
  args: {
    data: [48, 52, 47, 51, 49, 53, 50],
    min: 0,
    max: 100,
    area: true,
    className: 'w-[180px] text-warning',
    label: 'Cache hit rate',
  },
}

/** A single value is a level, so it draws as a flat rule. */
export const SingleValue: Story = {
  args: {
    data: [42],
    className: 'w-[160px]',
    label: 'One sample',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Sparkline data={[4, 9, 6, 12, 10, 15]} area className="h-6 w-[200px]" />
      <Sparkline data={[4, 9, 6, 12, 10, 15]} area className="h-10 w-[200px]" />
      <Sparkline data={[4, 9, 6, 12, 10, 15]} area className="h-16 w-[200px]" />
    </div>
  ),
}
