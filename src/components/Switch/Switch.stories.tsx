import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    defaultChecked: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

const ControlledExample = () => {
  const [on, setOn] = React.useState(true)
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={on}
        onCheckedChange={setOn}
        aria-label="Toggle notifications"
      />
      <span className="text-sm text-muted-foreground">
        Notifications are {on ? 'enabled' : 'disabled'}
      </span>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
}
