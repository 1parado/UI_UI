import { describe, expect, it } from 'vitest'
import {
  canMove,
  filterItems,
  panelSummary,
  partitionItems,
  selectAllState,
  selectableKeys,
  targetKeysAfterMove,
  toggleSelectAll,
  type TransferItem,
} from './transfer'

const items: TransferItem[] = [
  { key: 'a', title: 'Alpha' },
  { key: 'b', title: 'Beta', disabled: true },
  { key: 'c', title: 'Gamma team', description: 'Design' },
  { key: 'd', title: 'Delta' },
]

describe('targetKeysAfterMove', () => {
  it('adds a batch to the right without duplicating', () => {
    expect(targetKeysAfterMove(['a'], ['c', 'a', 'd'], 'to-target')).toEqual(['a', 'c', 'd'])
  })

  it('removes a batch from the right', () => {
    expect(targetKeysAfterMove(['a', 'b', 'c'], ['a', 'c'], 'to-source')).toEqual(['b'])
  })

  it('ignores keys already on the other side', () => {
    expect(targetKeysAfterMove(['a'], ['x'], 'to-source')).toEqual(['a'])
  })
})

describe('partitionItems', () => {
  it('splits in the order the caller passed', () => {
    const [source, target] = partitionItems(items, ['c', 'a'])
    expect(source.map((item) => item.key)).toEqual(['b', 'd'])
    expect(target.map((item) => item.key)).toEqual(['a', 'c'])
  })
})

describe('filterItems', () => {
  it('returns everything for an empty query', () => {
    expect(filterItems(items, '  ')).toBe(items)
  })

  it('matches title and description', () => {
    expect(filterItems(items, 'design').map((i) => i.key)).toEqual(['c'])
    expect(filterItems(items, 'gamma').map((i) => i.key)).toEqual(['c'])
  })

  it('requires every whitespace-separated word', () => {
    expect(filterItems(items, 'gamma design').map((i) => i.key)).toEqual(['c'])
    expect(filterItems(items, 'gamma delta')).toEqual([])
  })

  it('hands the query to a custom filter', () => {
    const onlyB = filterItems(items, 'irrelevant', (_query, item) => item.key === 'b')
    expect(onlyB.map((i) => i.key)).toEqual(['b'])
  })
})

describe('selectableKeys', () => {
  it('skips disabled rows', () => {
    expect(selectableKeys(items)).toEqual(['a', 'c', 'd'])
  })
})

describe('selectAllState', () => {
  it('describes how much of a panel is ticked', () => {
    const visible = [items[0], items[2]]
    expect(selectAllState(visible, [])).toBe('none')
    expect(selectAllState(visible, ['a'])).toBe('some')
    expect(selectAllState(visible, ['a', 'c'])).toBe('all')
  })

  it('ignores disabled rows entirely', () => {
    expect(selectAllState(items, ['a', 'c', 'd'])).toBe('all')
    expect(selectAllState([items[1]], [])).toBe('none')
  })
})

describe('toggleSelectAll', () => {
  it('ticks every movable row in the panel', () => {
    expect(toggleSelectAll(items, [])).toEqual(['a', 'c', 'd'])
  })

  it('keeps ticks that belong to the other panel', () => {
    expect(toggleSelectAll([items[0]], ['b'])).toEqual(['b', 'a'])
  })

  it('unticks everything visible once all of it is ticked', () => {
    expect(toggleSelectAll(items, ['a', 'c', 'd', 'b'])).toEqual(['b'])
  })
})

describe('panelSummary', () => {
  it('counts rows in the panel and how many are ticked', () => {
    expect(panelSummary(items, ['a', 'c'])).toEqual({ selected: 2, total: 4 })
  })

  it('follows the filtered view rather than the whole side', () => {
    expect(panelSummary([items[0]], ['a', 'c'])).toEqual({ selected: 1, total: 1 })
  })
})

describe('canMove', () => {
  it('needs at least one ticked row', () => {
    expect(canMove([])).toBe(false)
    expect(canMove(['a'])).toBe(true)
  })
})
