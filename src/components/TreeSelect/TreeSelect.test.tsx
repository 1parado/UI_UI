import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TreeSelect } from './TreeSelect'
import type { TreeSelectNode } from '@/lib/tree-select'

const tree: TreeSelectNode[] = [
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
        ],
      },
      { id: 'lib', label: 'lib', children: [{ id: 'utils', label: 'utils.ts' }] },
    ],
  },
  { id: 'readme', label: 'README.md', disabled: true },
]

const trigger = () => screen.getByRole('combobox')
const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(trigger())
  return screen.findByRole('tree')
}

describe('TreeSelect', () => {
  it('opens a collapsed tree on the root rows', async () => {
    const user = userEvent.setup()
    render(<TreeSelect treeData={tree} aria-label="Files" />)

    await openPanel(user)

    expect(screen.getByRole('treeitem', { name: 'src' })).toBeInTheDocument()
    expect(screen.queryByRole('treeitem', { name: 'Button.tsx' })).not.toBeInTheDocument()
  })

  it('expands a folder from its chevron without selecting it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    const srcRow = screen.getByRole('treeitem', { name: 'src' })
    await user.click(srcRow.querySelector('[role="presentation"]') as HTMLElement)

    expect(await screen.findByRole('treeitem', { name: 'components' })).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('opens a folder instead of answering with it, in single mode', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'src' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(await screen.findByRole('treeitem', { name: 'components' })).toBeInTheDocument()
  })

  it('answers with one id in single mode and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'src' }))
    await user.click(screen.getByRole('treeitem', { name: 'components' }))
    await user.click(screen.getByRole('treeitem', { name: 'Button.tsx' }))

    expect(onChange).toHaveBeenCalledWith('button', expect.any(Array))
    expect(trigger()).toHaveTextContent('Button.tsx')
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('cascades a tick through the whole branch', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} multiple onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'src' }))

    expect(onChange.mock.calls[0][0]).toEqual([
      'src',
      'components',
      'button',
      'input',
      'lib',
      'utils',
    ])
  })

  it('draws a dash for a folder holding one ticked child', async () => {
    const user = userEvent.setup()
    render(
      <TreeSelect treeData={tree} multiple defaultExpandAll aria-label="Files" />
    )

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'src' }))
    // Untick one descendant: the folder is no longer fully covered.
    await user.click(screen.getByRole('treeitem', { name: 'Button.tsx' }))

    expect(screen.getByRole('treeitem', { name: 'components' })).toHaveAttribute(
      'aria-checked',
      'mixed'
    )
  })

  it('takes the branch away again', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} multiple onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'src' }))
    await user.click(screen.getByRole('treeitem', { name: 'src' }))

    expect(onChange.mock.calls[1][0]).toEqual([])
  })

  it('ignores disabled rows', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} multiple onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    await user.click(screen.getByRole('treeitem', { name: 'README.md' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('prunes the tree to what a search reaches, already unfolded', async () => {
    const user = userEvent.setup()
    render(<TreeSelect treeData={tree} aria-label="Files" />)

    await openPanel(user)
    await user.type(screen.getByRole('textbox', { name: 'Search…' }), 'input')

    // The path stays visible; a stray leaf with no parent would be useless.
    expect(await screen.findByRole('treeitem', { name: 'src' })).toBeInTheDocument()
    expect(screen.getByRole('treeitem', { name: 'Input.tsx' })).toBeInTheDocument()
    expect(screen.queryByRole('treeitem', { name: 'utils.ts' })).not.toBeInTheDocument()
  })

  it('says so when nothing survives the search', async () => {
    const user = userEvent.setup()
    render(<TreeSelect treeData={tree} aria-label="Files" />)

    await openPanel(user)
    await user.type(screen.getByRole('textbox', { name: 'Search…' }), 'atlantis')

    expect(await screen.findByText('No matches')).toBeInTheDocument()
  })

  it('walks the rows from the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSelect treeData={tree} onChange={onChange} aria-label="Files" />)

    await openPanel(user)
    screen.getByRole('treeitem', { name: 'src' }).focus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('treeitem', { name: 'README.md' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByRole('treeitem', { name: 'components' })).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('treeitem', { name: 'Button.tsx' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('button', expect.any(Array))
  })

  it('clears everything from its trailing button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TreeSelect
        treeData={tree}
        multiple
        defaultValue={['src', 'components', 'button']}
        onChange={onChange}
        clearable
        aria-label="Files"
      />
    )

    expect(trigger()).toHaveTextContent('components')
    await user.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(onChange).toHaveBeenCalledWith([], [])
    expect(trigger()).toHaveTextContent('Select an option')
  })
})
