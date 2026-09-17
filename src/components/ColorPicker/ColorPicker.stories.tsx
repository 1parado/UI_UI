import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorPicker, ColorSwatch } from './ColorPicker'

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ColorPicker>

export const Default: Story = {
  args: {
    defaultValue: '#2563eb',
  },
}

/** The picker holds its own value when only `defaultValue` is given. */
export const CustomPresets: Story = {
  args: {
    defaultValue: '#16a34a',
    presets: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#e2e8f0', '#16a34a', '#22c55e', '#4ade80'],
  },
}

/**
 * `native` hands off to the operating system's colour dialog. Worth reaching
 * for on touch devices, where the platform picker is the familiar one.
 */
export const Native: Story = {
  args: {
    defaultValue: '#db2777',
    native: true,
  },
}

const ControlledExample = () => {
  const [color, setColor] = React.useState('#7c3aed')

  return (
    <div className="flex items-center gap-4">
      <ColorPicker value={color} onValueChange={setColor} />
      <span className="text-sm text-muted-foreground">
        Selected <code className="font-mono uppercase">{color}</code>
      </span>
    </div>
  )
}

/** Pass `value` with `onValueChange` to drive the value from your own state. */
export const Controlled: Story = {
  render: () => <ControlledExample />,
}

/** `ColorSwatch` is exported on its own for legends and list markers. */
export const Swatches: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ColorSwatch color="#0ea5e9" />
      <ColorSwatch color="#22c55e" />
      <ColorSwatch color="#f59e0b" />
      <ColorSwatch color="#ef4444" />
      <ColorSwatch color="#a855f7" className="h-6 w-6 rounded-md" />
    </div>
  ),
}
