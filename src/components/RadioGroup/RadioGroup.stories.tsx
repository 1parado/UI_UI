import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, Radio } from './RadioGroup'
import { Label } from '../Label'

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="email" name="contact">
      <div className="flex items-center gap-2">
        <Radio value="email" id="r-email" />
        <Label htmlFor="r-email">Email</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio value="phone" id="r-phone" />
        <Label htmlFor="r-phone">Phone</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio value="mail" id="r-mail" />
        <Label htmlFor="r-mail">Physical mail</Label>
      </div>
    </RadioGroup>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="email" name="contact-disabled">
      <div className="flex items-center gap-2">
        <Radio value="email" id="d-email" />
        <Label htmlFor="d-email">Email</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio value="phone" id="d-phone" disabled />
        <Label htmlFor="d-phone">Phone (unavailable)</Label>
      </div>
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      defaultValue="sm"
      name="size"
      className="flex items-center gap-4"
    >
      {['sm', 'default', 'lg'].map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Radio value={size} id={`size-${size}`} />
          <Label htmlFor={`size-${size}`}>{size}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}
