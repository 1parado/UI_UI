import { describe, expect, it } from 'vitest'
import {
  columnsFor,
  explore,
  findOptionPath,
  isCompletePath,
  isLeaf,
  leafPaths,
  optionLabels,
  searchLeafPaths,
  siblingValue,
  type CascaderOption,
} from './cascader'

const options: CascaderOption[] = [
  {
    value: 'zj',
    label: 'Zhejiang',
    children: [
      {
        value: 'hz',
        label: 'Hangzhou',
        children: [
          { value: 'xh', label: 'Xihu' },
          { value: 'gs', label: 'Gongshu' },
        ],
      },
      {
        value: 'nb',
        label: 'Ningbo',
        children: [{ value: 'hz2', label: 'Haishu' }],
      },
    ],
  },
  {
    value: 'js',
    label: 'Jiangsu',
    children: [
      {
        value: 'nj',
        label: 'Nanjing',
        children: [{ value: 'xw', label: 'Xuanwu', disabled: true }],
      },
    ],
  },
  { value: 'legacy', label: 'Legacy (no children)' },
]

describe('findOptionPath', () => {
  it('follows a full chain', () => {
    const path = findOptionPath(options, ['zj', 'hz', 'xh'])
    expect(path.map((option) => option.label)).toEqual([
      'Zhejiang',
      'Hangzhou',
      'Xihu',
    ])
  })

  it('stops where the ids stop matching', () => {
    expect(findOptionPath(options, ['zj', 'nope']).map((o) => o.value)).toEqual(['zj'])
    expect(findOptionPath(options, ['atlantis'])).toEqual([])
  })
})

describe('isLeaf', () => {
  it('treats a missing or empty children list as a leaf', () => {
    expect(isLeaf({ value: 'a', label: 'A' })).toBe(true)
    expect(isLeaf({ value: 'a', label: 'A', children: [] })).toBe(true)
    expect(isLeaf({ value: 'a', label: 'A', children: [{ value: 'b', label: 'B' }] })).toBe(false)
  })
})

describe('optionLabels', () => {
  it('joins the labels of the chain', () => {
    expect(optionLabels(options, ['zj', 'hz', 'gs'])).toBe('Zhejiang / Hangzhou / Gongshu')
  })

  it('honours a custom separator', () => {
    expect(optionLabels(options, ['zj', 'hz'], ' → ')).toBe('Zhejiang → Hangzhou')
  })

  it('renders an empty selection as an empty string', () => {
    expect(optionLabels(options, [])).toBe('')
  })
})

describe('isCompletePath', () => {
  it('is only true when the last id is a leaf', () => {
    expect(isCompletePath(options, ['zj', 'hz', 'xh'])).toBe(true)
    expect(isCompletePath(options, ['zj', 'hz'])).toBe(false)
    expect(isCompletePath(options, ['legacy'])).toBe(true)
  })

  it('rejects empty and unknown paths', () => {
    expect(isCompletePath(options, [])).toBe(false)
    expect(isCompletePath(options, ['zj', 'atlantis'])).toBe(false)
  })
})

describe('columnsFor', () => {
  it('always starts at the root', () => {
    const columns = columnsFor(options, [])
    expect(columns).toHaveLength(1)
    expect(columns[0]).toBe(options)
  })

  it('opens one column per explored level', () => {
    const columns = columnsFor(options, ['zj', 'hz'])
    expect(columns.map((column) => column.map((option) => option.value))).toEqual([
      ['zj', 'js', 'legacy'],
      ['hz', 'nb'],
      ['xh', 'gs'],
    ])
  })

  it('stops at a leaf instead of adding an empty column', () => {
    expect(columnsFor(options, ['legacy'])).toHaveLength(1)
    expect(columnsFor(options, ['zj', 'hz', 'xh'])).toHaveLength(3)
  })

  it('ignores ids that do not resolve', () => {
    expect(columnsFor(options, ['atlantis'])).toHaveLength(1)
  })
})

describe('leafPaths', () => {
  it('collects every leaf with its chain', () => {
    expect(leafPaths(options).map((path) => path.values)).toEqual([
      ['zj', 'hz', 'xh'],
      ['zj', 'hz', 'gs'],
      ['zj', 'nb', 'hz2'],
      ['js', 'nj', 'xw'],
      ['legacy'],
    ])
  })

  it('inherits disabled from any ancestor', () => {
    const paths = leafPaths(options)
    const xuanwu = paths.find((path) => last(path.values) === 'xw')
    expect(xuanwu?.disabled).toBe(true)

    const xihu = paths.find((path) => last(path.values) === 'xh')
    expect(xihu?.disabled).toBe(false)
  })
})

const last = <T,>(values: T[]) => values[values.length - 1]

describe('searchLeafPaths', () => {
  it('matches anywhere in the label chain', () => {
    const hits = searchLeafPaths(options, 'hang')
    expect(hits.map((path) => last(path.labels))).toEqual(['Xihu', 'Gongshu'])
  })

  it('is case-insensitive and trims the query', () => {
    expect(searchLeafPaths(options, '  XIhu  ').map((p) => last(p.values))).toEqual(['xh'])
  })

  it('returns nothing for an empty query', () => {
    expect(searchLeafPaths(options, '   ')).toEqual([])
  })

  it('caps how many results come back', () => {
    expect(searchLeafPaths(options, 'e', 2)).toHaveLength(2)
  })
})

describe('explore', () => {
  it('replaces one level and drops the deeper ones', () => {
    expect(explore(['zj', 'hz', 'xh'], 1, 'nb')).toEqual(['zj', 'nb'])
    expect(explore(['zj', 'hz'], 0, 'js')).toEqual(['js'])
  })
})

describe('siblingValue', () => {
  it('wraps past both ends', () => {
    expect(siblingValue(options, 'zj', 1)).toBe('js')
    expect(siblingValue(options, 'legacy', 1)).toBe('zj')
    expect(siblingValue(options, 'js', -1)).toBe('zj')
  })

  it('falls back to the first row when nothing is focused', () => {
    expect(siblingValue(options, 'nope', 1)).toBe('zj')
    expect(siblingValue([], 'nope', 1)).toBeUndefined()
  })
})
