import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tree, type TreeNode } from './Tree'
import { FileTree } from './FileTree'
import { FolderIcon, SettingsIcon, FileIcon } from '@/lib/icons'

const meta: Meta<typeof Tree> = {
  title: 'Components/Tree',
  component: Tree,
  tags: ['autodocs'],
  args: { label: 'Repository' },
}

export default meta
type Story = StoryObj<typeof Tree>

const repo: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    defaultExpanded: true,
    children: [
      {
        id: 'src/components',
        label: 'components',
        children: [
          { id: 'src/components/Button.tsx', label: 'Button.tsx' },
          { id: 'src/components/Input.tsx', label: 'Input.tsx' },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts' },
      { id: 'src/lib', label: 'lib', children: [{ id: 'src/lib/utils.ts', label: 'utils.ts' }] },
    ],
  },
  { id: 'README.md', label: 'README.md' },
  { id: 'pnpm-lock.yaml', label: 'pnpm-lock.yaml', disabled: true },
]

export const Default: Story = {
  args: { nodes: repo, className: 'w-[280px] rounded-lg border border-border p-1' },
}

const ControlledDemo = () => {
  const [selected, setSelected] = React.useState('src/index.ts')

  return (
    <div className="w-[320px] space-y-2">
      <Tree
        label="Repository"
        nodes={repo}
        selectedId={selected}
        onSelect={(node) => setSelected(node.id)}
        className="rounded-lg border border-border p-1"
      />
      <p className="px-1 text-xs text-muted-foreground">Selected: {selected}</p>
    </div>
  )
}

/** Selection can be owned from outside, which is what a picker needs. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

const FilterDemo = () => {
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    if (!query) return repo
    const keep = (node: TreeNode): TreeNode | null => {
      const children = (node.children ?? []).map(keep).filter(Boolean) as TreeNode[]
      const matches = String(node.label).toLowerCase().includes(query.toLowerCase())
      return matches || children.length ? { ...node, children: children.length ? children : undefined } : null
    }
    return repo.map(keep).filter(Boolean) as TreeNode[]
  }, [query])

  return (
    <div className="w-[320px] space-y-2">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter files…"
        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
      />
      {/* The tree re-mounts on a new filter so the newly revealed folders start open. */}
      <Tree
        key={query}
        label="Filtered repository"
        nodes={filtered}
        defaultExpandedIds={['src', 'src/components', 'src/lib']}
        className="rounded-lg border border-border p-1"
      />
    </div>
  )
}

/** Filtering is the caller's job: the tree renders the nodes it is given. */
export const WithFilter: Story = {
  render: () => <FilterDemo />,
}

/** A settings menu is a tree where only the leaves are interesting. */
export const WithoutAutoExpand: Story = {
  args: {
    label: 'Settings',
    nodes: [
      { id: 'account', label: 'Account', children: [{ id: 'account/profile', label: 'Profile' }] },
      { id: 'billing', label: 'Billing', children: [{ id: 'billing/plans', label: 'Plans' }] },
    ],
    expandOnSelect: false,
    renderIcon: (node) => (node.children ? <FolderIcon /> : <SettingsIcon />),
    className: 'w-[240px] rounded-lg border border-border p-1',
  },
}

/** `FileTree` takes paths and builds the nesting itself. */
export const Files: Story = {
  render: () => (
    <FileTree
      header="UI_UI"
      className="w-[300px]"
      paths={[
        'src/index.ts',
        'src/components/Button/Button.tsx',
        'src/components/Button/Button.test.tsx',
        'src/lib/utils.ts',
        'src/styles/globals.css',
        'public/logo.png',
        'README.md',
        'package.json',
        'pnpm-lock.yaml',
      ]}
      onSelect={(node) => console.log('open', node.id)}
    />
  ),
}

/** The same tree closed, for a collapsed sidebar state. */
export const FilesCollapsed: Story = {
  render: () => (
    <FileTree
      header="UI_UI"
      defaultExpanded={false}
      className="w-[300px]"
      paths={['src/index.ts', 'src/lib/utils.ts', 'README.md']}
    />
  ),
}

export const FilesEmpty: Story = {
  render: () => <FileTree className="w-[300px]" header="New project" paths={[]} />,
}

/** An agent's plan is a tree too — the extra data rides along to `onSelect`. */
export const AgentSteps: Story = {
  render: () => (
    <Tree
      label="Agent steps"
      nodes={[
        {
          id: 'read',
          label: 'Read the repository',
          icon: <FileIcon />,
          defaultExpanded: true,
          children: [
            { id: 'read/1', label: 'src/index.ts' },
            { id: 'read/2', label: 'package.json' },
          ],
        },
        { id: 'edit', label: 'Edit src/index.ts', icon: <FileIcon /> },
        { id: 'test', label: 'Run the suite', icon: <FileIcon />, disabled: true },
      ]}
      className="w-[280px] rounded-lg border border-border p-1"
    />
  ),
}
