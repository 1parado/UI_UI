import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColumnsIcon, RowsIcon, StarIcon } from '@/lib/icons'
import { Segmented, SegmentedItem } from './Segmented'

const meta = {
  title: 'Components/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One choice out of a few, all of them visible. Unlike a row of toggles, this announces itself as a **radio group**: one tab stop, arrow keys to move, `aria-checked` on the selection. The thumb is measured off the selected button, so options do not have to be the same width.',
      },
    },
  },
  args: {
    defaultValue: 'list',
    options: [
      { value: 'list', label: 'List' },
      { value: 'board', label: 'Board' },
      { value: 'timeline', label: 'Timeline' },
    ],
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Segmented>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Segmented key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const WithIcons: Story = {
  args: {
    defaultValue: 'list',
    options: [
      {
        value: 'list',
        label: 'List',
        icon: <RowsIcon aria-hidden className="size-3.5" />,
      },
      {
        value: 'board',
        label: 'Board',
        icon: <ColumnsIcon aria-hidden className="size-3.5" />,
      },
    ],
  },
}

/** Equal shares of the full width — the shape used in a mobile toolbar. */
export const Block: Story = {
  args: { block: true, className: 'w-[360px]' },
}

export const WithADisabledOption: Story = {
  args: {
    defaultValue: 'list',
    options: [
      { value: 'list', label: 'List' },
      { value: 'board', label: 'Board', disabled: true },
      { value: 'timeline', label: 'Timeline' },
    ],
  },
}

const ControlledDemo = () => {
  const [view, setView] = React.useState('board')

  return (
    <div className="space-y-3">
      <Segmented
        value={view}
        onValueChange={setView}
        labels={{ group: 'View' }}
        options={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      />
      <p className="text-sm text-muted-foreground">Showing: {view}</p>
    </div>
  )
}

export const Controlled: Story = { render: () => <ControlledDemo /> }

const ComposedDemo = () => {
  const [value, setValue] = React.useState('all')
  const rows = [
    { value: 'all', label: 'All' as React.ReactNode },
    { value: 'starred', label: <StarIcon aria-hidden className="size-3.5" /> },
  ]

  return (
    <Segmented>
      {rows.map((row) => (
        <SegmentedItem
          key={row.value}
          value={row.value}
          selected={value === row.value}
          onClick={() => setValue(row.value)}
        >
          {row.label}
        </SegmentedItem>
      ))}
    </Segmented>
  )
}

/** Compose the rows yourself when one of them needs its own markup. */
export const ComposedChildren: Story = { render: () => <ComposedDemo /> }
