import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tree, type TreeNode } from './Tree'
import { FileTree } from './FileTree'

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/index.ts', label: 'index.ts' },
      { id: 'src/app.tsx', label: 'app.tsx', disabled: true },
    ],
  },
  { id: 'README.md', label: 'README.md' },
]

const items = () => screen.getAllByRole('treeitem')
const item = (name: string) => screen.getByRole('treeitem', { name })

/** The row the roving tabindex is currently on. */
const tabbable = () => items().filter((row) => row.getAttribute('tabindex') === '0')

describe('Tree', () => {
  it('is a named tree', () => {
    render(<Tree nodes={nodes} label="Repository" />)

    expect(screen.getByRole('tree', { name: 'Repository' })).toBeInTheDocument()
  })

  it('shows only the top level until something is opened', () => {
    render(<Tree nodes={nodes} />)

    expect(items().map((row) => row.textContent)).toEqual(['src', 'README.md'])
  })

  it('marks a node with children as expandable and a leaf as not', () => {
    render(<Tree nodes={nodes} />)

    expect(item('src')).toHaveAttribute('aria-expanded', 'false')
    expect(item('README.md')).not.toHaveAttribute('aria-expanded')
  })

  it('states the depth of each row', () => {
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    expect(item('src')).toHaveAttribute('aria-level', '1')
    expect(item('index.ts')).toHaveAttribute('aria-level', '2')
  })

  it('keeps exactly one row in the tab order', () => {
    render(<Tree nodes={nodes} />)
    const rows = items()

    expect(tabbable()).toHaveLength(1)
    expect(rows[0]).toHaveAttribute('tabindex', '0')
    expect(rows[1]).toHaveAttribute('tabindex', '-1')
  })

  it('opens a folder when it is selected', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Tree nodes={nodes} onSelect={onSelect} />)

    await user.click(item('src'))

    expect(item('src')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }))
  })

  it('closes it again on a second click', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    await user.click(item('src'))

    expect(screen.queryByRole('treeitem', { name: 'index.ts' })).not.toBeInTheDocument()
  })

  it('leaves the tree alone when selecting is all that matters', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} expandOnSelect={false} />)

    await user.click(item('src'))

    expect(item('src')).toHaveAttribute('aria-expanded', 'false')
    expect(item('src')).toHaveAttribute('aria-selected', 'true')
  })

  it('does not select a disabled row', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} onSelect={onSelect} />)

    const disabled = screen.getByRole('treeitem', { name: 'app.tsx' })
    expect(disabled).toHaveAttribute('aria-disabled', 'true')

    await user.click(disabled)

    expect(onSelect).not.toHaveBeenCalled()
    expect(disabled).toHaveAttribute('aria-selected', 'false')
  })
})

describe('Tree keyboard', () => {
  it('walks the visible rows with the arrows', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} />)

    item('src').focus()
    await user.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(item('README.md'))

    await user.keyboard('{ArrowUp}')

    expect(document.activeElement).toBe(item('src'))
  })

  it('skips a disabled row', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    item('src').focus()
    await user.keyboard('{ArrowDown}{ArrowDown}')

    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'README.md' }))
  })

  it('jumps to either end', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    item('src').focus()
    await user.keyboard('{End}')

    expect(document.activeElement).toBe(item('README.md'))

    await user.keyboard('{Home}')

    expect(document.activeElement).toBe(item('src'))
  })

  it('opens with the right arrow, then steps into the children', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} />)

    item('src').focus()
    await user.keyboard('{ArrowRight}')

    expect(item('src')).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'index.ts' }))
  })

  it('does nothing on the right arrow at a leaf', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} />)

    item('README.md').focus()
    await user.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(item('README.md'))
  })

  it('closes with the left arrow, then walks back up to the parent', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    item('src').focus()
    await user.keyboard('{ArrowLeft}')

    expect(item('src')).toHaveAttribute('aria-expanded', 'false')

    item('src').focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(item('src'))
  })

  it('moves to the parent from a child', async () => {
    const user = userEvent.setup()
    render(<Tree nodes={nodes} defaultExpandedIds={['src']} />)

    screen.getByRole('treeitem', { name: 'index.ts' }).focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(item('src'))
  })

  it('selects with Enter and with Space', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Tree nodes={nodes} onSelect={onSelect} />)

    item('README.md').focus()
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'README.md' }))

    item('README.md').focus()
    await user.keyboard(' ')

    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(item('README.md')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Tree state', () => {
  it('holds its own selection and reports it', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<Tree nodes={nodes} onSelectedChange={onSelectedChange} />)

    await user.click(item('README.md'))

    expect(item('README.md')).toHaveAttribute('aria-selected', 'true')
    expect(onSelectedChange).toHaveBeenCalledWith('README.md')
  })

  it('leaves the open set to the caller when it is controlled', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <Tree nodes={nodes} expandedIds={[]} onExpandedChange={onExpandedChange} />
    )

    await user.click(item('src'))

    expect(onExpandedChange).toHaveBeenCalledWith(['src'])
    // Still closed: the caller owns the set and has not changed it.
    expect(item('src')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the nodes marked as expanded by default', () => {
    render(
      <Tree
        nodes={[
          { id: 'a', label: 'a', defaultExpanded: true, children: [{ id: 'a/1', label: '1' }] },
        ]}
      />
    )

    expect(item('a')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('treeitem', { name: '1' })).toBeInTheDocument()
  })

  it('draws an icon for each row when asked', () => {
    const { container } = render(
      <Tree nodes={nodes} renderIcon={() => <svg data-testid="icon" />} />
    )

    expect(container.querySelectorAll('[data-testid="icon"]')).toHaveLength(2)
  })
})

describe('FileTree', () => {
  const paths = ['src/index.ts', 'src/components/Button.tsx', 'README.md']

  it('nests the paths it is given', () => {
    render(<FileTree paths={paths} />)

    expect(items().map((row) => row.textContent)).toEqual([
      'src',
      'components',
      'Button.tsx',
      'index.ts',
      'README.md',
    ])
  })

  it('opens every folder by default', () => {
    render(<FileTree paths={paths} />)

    expect(item('src')).toHaveAttribute('aria-expanded', 'true')
    expect(item('components')).toHaveAttribute('aria-expanded', 'true')
  })

  it('stays closed when asked', () => {
    render(<FileTree paths={paths} defaultExpanded={false} />)

    expect(item('src')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('treeitem', { name: 'index.ts' })).not.toBeInTheDocument()
  })

  it('strips the root prefix', () => {
    render(<FileTree paths={['app/a.ts', 'app/b.ts']} root="app" />)

    expect(items().map((row) => row.textContent)).toEqual(['a.ts', 'b.ts'])
  })

  it('says so when there is nothing to list', () => {
    render(<FileTree paths={[]} />)

    expect(screen.getByText('No files')).toBeInTheDocument()
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('accepts a custom empty message and a header', () => {
    render(<FileTree paths={[]} emptyMessage="暂无文件" header="UI_UI" />)

    expect(screen.getByText('暂无文件')).toBeInTheDocument()
    expect(screen.getByText('UI_UI')).toBeInTheDocument()
  })

  it('reports the selected path', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FileTree paths={paths} onSelect={onSelect} />)

    await user.click(item('index.ts'))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'src/index.ts' }))
  })
})
