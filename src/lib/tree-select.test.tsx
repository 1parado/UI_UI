import { describe, expect, it } from 'vitest'
import {
  allExpandedIds,
  applyToggle,
  branchIds,
  defaultExpandedIds,
  filterTree,
  findNode,
  labelsFor,
  nodeState,
  nodeText,
  nodesFor,
  visibleRows,
  type TreeSelectNode,
} from './tree-select'

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
  { id: 'jsxNode', label: <b>not a string</b> },
]

describe('nodeText', () => {
  it('returns string labels and nothing else', () => {
    expect(nodeText(tree[1])).toBe('README.md')
    expect(nodeText(tree[2])).toBe('')
  })
})

describe('visibleRows', () => {
  it('lists the root level when nothing is expanded', () => {
    expect(visibleRows(tree, []).map((row) => row.node.id)).toEqual([
      'src',
      'readme',
      'jsxNode',
    ])
  })

  it('opens one level per expanded id', () => {
    const rows = visibleRows(tree, ['src'])
    expect(rows.map((row) => row.node.id)).toEqual(['src', 'components', 'lib', 'readme', 'jsxNode'])
    expect(rows.find((row) => row.node.id === 'components')?.level).toBe(2)
  })

  it('carries the parent id of every nested row', () => {
    const rows = visibleRows(tree, ['src', 'components'])
    expect(rows.find((row) => row.node.id === 'button')?.parentId).toBe('components')
  })

  it('does not expand a leaf even if its id is listed', () => {
    const rows = visibleRows(tree, ['readme'])
    expect(rows.find((row) => row.node.id === 'readme')?.expanded).toBe(false)
  })
})

describe('findNode and nodesFor', () => {
  it('finds a node anywhere in the tree', () => {
    expect(findNode(tree, 'utils')?.label).toBe('utils.ts')
    expect(findNode(tree, 'nope')).toBeUndefined()
  })

  it('keeps the caller order and drops unknown ids', () => {
    expect(nodesFor(tree, ['input', 'nope', 'src']).map((node) => node.id)).toEqual([
      'input',
      'src',
    ])
  })
})

describe('labelsFor', () => {
  it('maps ids back to labels', () => {
    expect(labelsFor(tree, ['src', 'button'])).toEqual(['src', 'Button.tsx'])
  })
})

describe('branchIds', () => {
  it('collects a node and everything under it', () => {
    expect(branchIds(findNode(tree, 'src')!)).toEqual([
      'src',
      'components',
      'button',
      'input',
      'lib',
      'utils',
    ])
  })
})

describe('applyToggle', () => {
  it('adds a whole branch without duplicates', () => {
    expect(applyToggle(['readme'], branchIds(findNode(tree, 'src')!), true)).toEqual([
      'readme',
      'src',
      'components',
      'button',
      'input',
      'lib',
      'utils',
    ])
  })

  it('removes the branch again', () => {
    const checked = applyToggle([], branchIds(findNode(tree, 'src')!), true)
    expect(applyToggle(checked, ['src', 'components', 'button', 'input', 'lib', 'utils'], false)).toEqual([])
  })
})

describe('nodeState', () => {
  it('reads the checkbox off the flat value list', () => {
    expect(nodeState(tree, 'components', [])).toBe('unchecked')
    expect(nodeState(tree, 'components', ['components', 'button'])).toBe('partial')
    expect(nodeState(tree, 'components', ['components', 'button', 'input'])).toBe('checked')
  })

  it('is unchecked for an unknown id', () => {
    expect(nodeState(tree, 'atlantis', ['atlantis'])).toBe('unchecked')
  })
})

describe('expanded id helpers', () => {
  it('collects every folder id', () => {
    expect(allExpandedIds(tree)).toEqual(['src', 'components', 'lib'])
  })

  it('honours defaultExpanded', () => {
    const marked: TreeSelectNode[] = [
      { id: 'a', label: 'a', children: [{ id: 'b', label: 'b' }], defaultExpanded: true },
      { id: 'c', label: 'c', children: [{ id: 'd', label: 'd' }] },
    ]
    expect(defaultExpandedIds(marked)).toEqual(['a'])
  })
})

describe('filterTree', () => {
  it('returns the tree untouched for an empty query', () => {
    expect(filterTree(tree, '  ')).toBe(tree)
  })

  it('keeps the path to a deep match', () => {
    const pruned = filterTree(tree, 'input')
    expect(pruned).toHaveLength(1)
    expect(pruned[0].id).toBe('src')
    expect(pruned[0].children?.[0].id).toBe('components')
    expect(pruned[0].children?.[0].children?.map((node) => node.id)).toEqual(['input'])
  })

  it('keeps the whole subtree of a matching folder', () => {
    const pruned = filterTree(tree, 'src')
    expect(pruned[0].children?.map((node) => node.id)).toEqual(['components', 'lib'])
  })

  it('drops everything else', () => {
    expect(filterTree(tree, 'readme').map((node) => node.id)).toEqual(['readme'])
  })

  it('never matches a node it cannot read', () => {
    expect(filterTree(tree, 'jsxnode')).toEqual([])
    expect(filterTree(tree, 'string')).toEqual([])
  })
})
