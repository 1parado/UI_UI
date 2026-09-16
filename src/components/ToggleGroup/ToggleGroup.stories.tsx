import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup'

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ToggleGroup>

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <ToggleGroup
      type="multiple"
      defaultValue={['bold']}
      aria-label="Text formatting"
    >
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const OutlineSmall: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      defaultValue="7d"
      aria-label="Date range"
    >
      <ToggleGroupItem value="24h">24h</ToggleGroupItem>
      <ToggleGroupItem value="7d">7d</ToggleGroupItem>
      <ToggleGroupItem value="30d">30d</ToggleGroupItem>
      <ToggleGroupItem value="all">All</ToggleGroupItem>
    </ToggleGroup>
  ),
}

const ControlledExample = () => {
  const [view, setView] = React.useState('list')

  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(next) => next && setView(next)}
        variant="outline"
        aria-label="View"
      >
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">
        Showing the {view} view. Selecting the active item again clears it.
      </p>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledExample /> }

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="a" aria-label="Disabled group">
      <ToggleGroupItem value="a">Alpha</ToggleGroupItem>
      <ToggleGroupItem value="b" disabled>
        Beta
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
