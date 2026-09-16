import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './Separator'

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {}

export const WithContent: Story = {
  render: () => (
    <div>
      <p className="text-sm">
        Radix Primitives is a low-level UI component library with
        accessibility in mind.
      </p>
      <Separator className="my-4" />
      <p className="text-sm">
        Use separators to create visual breaks between related groups of
        content.
      </p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Components</span>
      <Separator orientation="vertical" />
      <span>Stories</span>
    </div>
  ),
}
