import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './Progress'

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    max: {
      control: { type: 'number', min: 1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: {
    value: 33,
    className: 'w-[300px]',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    className: 'w-[300px]',
  },
}

export const Full: Story = {
  args: {
    value: 100,
    className: 'w-[300px]',
  },
}

export const CustomMax: Story = {
  args: {
    value: 3,
    max: 5,
    className: 'w-[300px]',
  },
}
