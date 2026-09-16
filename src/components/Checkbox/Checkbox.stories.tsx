import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'
import { Label } from '../Label'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    checked: {
      control: 'select',
      options: [true, false, 'indeterminate'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { 'aria-label': 'Accept terms' },
}

export const Checked: Story = {
  args: { defaultChecked: true, 'aria-label': 'Accept terms' },
}

export const Indeterminate: Story = {
  args: { checked: 'indeterminate', 'aria-label': 'Select all' },
}

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Accept terms' },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

const IndeterminateGroup = () => {
  const items = ['Orders', 'Payments', 'Deliveries']
  const [checked, setChecked] = React.useState<string[]>(['Orders'])
  const allChecked = checked.length === items.length
  const someChecked = checked.length > 0 && !allChecked

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="select-all"
          checked={allChecked ? true : someChecked ? 'indeterminate' : false}
          onCheckedChange={(state) => setChecked(state === true ? items : [])}
        />
        <Label htmlFor="select-all">Select all</Label>
      </div>
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2 pl-6">
          <Checkbox
            id={item}
            checked={checked.includes(item)}
            onCheckedChange={(state) =>
              setChecked((prev) =>
                state === true ? [...prev, item] : prev.filter((i) => i !== item)
              )
            }
          />
          <Label htmlFor={item}>{item}</Label>
        </div>
      ))}
    </div>
  )
}

export const IndeterminateControlled: Story = {
  render: () => <IndeterminateGroup />,
}
