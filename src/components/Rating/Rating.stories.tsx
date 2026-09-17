import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Rating } from './Rating'

const meta: Meta<typeof Rating> = {
  title: 'Components/Rating',
  component: Rating,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Rating>

export const Default: Story = {
  args: {
    defaultValue: 3,
  },
}

/** `step` is what allows a half; the stars clip a filled star at the fraction. */
export const HalfSteps: Story = {
  args: {
    defaultValue: 4.5,
    step: 0.5,
  },
}

export const ReadOnly: Story = {
  args: {
    value: 4,
    readOnly: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Rating defaultValue={3} size="sm" />
      <Rating defaultValue={3} />
      <Rating defaultValue={3} size="lg" />
    </div>
  ),
}

export const Empty: Story = {
  args: {
    defaultValue: 0,
    step: 0.5,
  },
}

const ControlledExample = () => {
  const [score, setScore] = React.useState(2)
  return (
    <div className="flex items-center gap-3">
      <Rating value={score} step={0.5} onValueChange={setScore} />
      <span className="text-sm text-muted-foreground tabular-nums">{score} / 5</span>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
}
