import type { Meta, StoryObj } from '@storybook/react'
import { RingProgress } from './RingProgress'

const meta: Meta<typeof RingProgress> = {
  title: 'Components/RingProgress',
  component: RingProgress,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RingProgress>

export const Default: Story = {
  args: {
    value: 72,
    label: 'Storage used',
  },
}

/** The caption is the place for the raw pair behind the percentage. */
export const WithCaption: Story = {
  args: {
    value: 72,
    label: 'Storage used',
    caption: '72 of 100 GB',
  },
}

/**
 * One variant per state of the same ratio. `warning` and `destructive` are
 * meant to be chosen from the data — see `UsageMeter` for the threshold logic
 * that decides which one applies.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <RingProgress value={28} variant="default" label="Within quota" />
      <RingProgress value={64} variant="success" label="Batch complete" />
      <RingProgress value={86} variant="warning" label="Nearing the limit" caption="86 / 100" />
      <RingProgress value={100} variant="destructive" label="Over the limit" caption="120 / 100" />
    </div>
  ),
}

/** Anything can go in the middle — a count, a unit, a whole composition. */
export const CustomCenter: Story = {
  render: () => (
    <RingProgress value={18} max={20} size={140} thickness={8} label="Seats filled">
      <span className="text-2xl font-semibold tabular-nums">18</span>
      <span className="mt-0.5 text-xs text-muted-foreground">of 20 seats</span>
    </RingProgress>
  ),
}

/** Thickness and diameter are independent; a thin ring reads as a gauge. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <RingProgress value={45} size={64} thickness={6} label="Small" />
      <RingProgress value={45} size={96} thickness={8} label="Medium" />
      <RingProgress value={45} size={140} thickness={14} label="Large" />
    </div>
  ),
}
