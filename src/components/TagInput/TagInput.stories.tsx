import type { Meta, StoryObj } from '@storybook/react'
import { TagInput } from './TagInput'

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TagInput>

export const Default: Story = {
  args: {
    defaultValue: ['beta', 'internal'],
    className: 'w-[360px]',
  },
}

export const Empty: Story = {
  args: {
    placeholder: 'Add a label and press Enter…',
    className: 'w-[360px]',
  },
}

/** The field disables itself once the limit is reached. */
export const WithLimit: Story = {
  args: {
    defaultValue: ['one', 'two'],
    max: 3,
    className: 'w-[360px]',
  },
}

export const Invalid: Story = {
  args: {
    defaultValue: ['duplicate'],
    invalid: true,
    className: 'w-[360px]',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: ['locked'],
    disabled: true,
    className: 'w-[360px]',
  },
}
