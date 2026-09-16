import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    invalid: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    rows: {
      control: { type: 'number', min: 2, max: 12 },
    },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
}

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: 'This field is required.',
  },
}

export const FixedHeight: Story = {
  args: {
    rows: 6,
    className: 'resize-none',
    placeholder: 'Non-resizable textarea (resize-none)',
  },
}
