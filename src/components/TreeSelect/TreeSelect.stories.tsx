import type { Meta, StoryObj } from '@storybook/react'
import { TreeSelect } from './TreeSelect'
import type { TreeSelectNode } from '@/lib/tree-select'

const files: TreeSelectNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
          { id: 'dialog', label: 'Dialog.tsx' },
        ],
      },
      {
        id: 'lib',
        label: 'lib',
        children: [
          { id: 'utils', label: 'utils.ts' },
          { id: 'diff', label: 'diff.ts' },
        ],
      },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    children: [{ id: 'guide', label: 'getting-started.md' }],
  },
  { id: 'readme', label: 'README.md', disabled: true },
]

const meta = {
  title: 'Components/TreeSelect',
  component: TreeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The same tree data `Tree` renders, compressed into a dropdown. Ticking a folder ticks everything under it; a folder with only some children ticked draws a dash instead of a tick. Search prunes the tree to what it can still reach and opens the survivors — a matched leaf would be useless without the path that reaches it. Nodes take the same shape `Tree` uses, so one tree can feed both.',
      },
    },
  },
  args: {
    treeData: files,
    'aria-label': 'Files',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TreeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Multiple: Story = {
  args: { multiple: true, clearable: true, placeholder: 'Pick files' },
}

export const ExpandAll: Story = {
  args: { defaultExpandAll: true },
  parameters: {
    docs: {
      description: {
        story: 'For shallow trees worth reading in one glance.',
      },
    },
  },
}

export const WithoutSearch: Story = {
  args: { showSearch: false, multiple: true },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'utils' },
}
