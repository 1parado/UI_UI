import { describe, expect, it } from 'vitest'
import {
  groupOptions,
  matchOptions,
  nextIndex,
  normalizeOptions,
  optionText,
  selectableIndex,
  type AutoCompleteOption,
} from './autocomplete'

const options: (string | AutoCompleteOption)[] = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper', keywords: ['compiler', 'navy'], disabled: true },
  { value: 'radia', label: 'Radia Perlman', group: 'Networks' },
  { value: 'barbara', label: 'Barbara Liskov', group: 'Networks' },
  'plain string',
]

describe('normalizeOptions', () => {
  it('promotes bare strings to options', () => {
    expect(normalizeOptions(['a', { value: 'b' }])).toEqual([{ value: 'a' }, { value: 'b' }])
  })
})

describe('optionText', () => {
  it('prefers the label, falling back to the value', () => {
    expect(optionText({ value: 'ada' })).toBe('ada')
    expect(optionText({ value: 'ada', label: 'Ada Lovelace' })).toBe('Ada Lovelace')
  })
})

describe('matchOptions', () => {
  it('shows everything for an empty query', () => {
    expect(matchOptions(options, '  ')).toHaveLength(5)
  })

  it('matches anywhere by default', () => {
    expect(matchOptions(options, 'perl').map((option) => option.value)).toEqual(['radia'])
  })

  it('restricts to the front with startsWith', () => {
    expect(matchOptions(options, 'a', { mode: 'startsWith' }).map((o) => o.value)).toEqual(['ada'])
  })

  it('looks in keywords too', () => {
    expect(matchOptions(options, 'navy').map((option) => option.value)).toEqual(['grace'])
  })

  it('hands the query to a custom filter', () => {
    const hits = matchOptions(options, 'irrelevant', {
      mode: 'fn',
      filterOption: (_query, option) => option.value === 'radia',
    })
    expect(hits.map((option) => option.value)).toEqual(['radia'])
  })

  it('caps how many rows come back', () => {
    expect(matchOptions(options, 'a', { limit: 2 })).toHaveLength(2)
  })

  it('is case-insensitive', () => {
    expect(matchOptions(options, 'PERL').map((option) => option.value)).toEqual(['radia'])
  })
})

describe('groupOptions', () => {
  it('groups in place, keeping the options in the order given', () => {
    const groups = groupOptions(normalizeOptions(options))

    expect(groups.map((group) => group.group)).toEqual([undefined, 'Networks', undefined])
    expect(groups[0].options.map((option) => option.value)).toEqual(['ada', 'grace'])
    expect(groups[1].options.map((option) => option.value)).toEqual(['radia', 'barbara'])
    expect(groups[2].options.map((option) => option.value)).toEqual(['plain string'])
  })

  it('returns nothing for an empty list', () => {
    expect(groupOptions([])).toEqual([])
  })
})

describe('nextIndex', () => {
  it('steps through the list and wraps', () => {
    const all = normalizeOptions(options)
    expect(nextIndex(all, -1, 1)).toBe(0)
    expect(nextIndex(all, 4, 1)).toBe(0)
    expect(nextIndex(all, 0, -1)).toBe(4)
  })

  it('skips disabled rows', () => {
    const all = normalizeOptions(options)
    expect(nextIndex(all, 0, 1)).toBe(2)
  })

  it('gives up when every row is disabled', () => {
    const blocked: AutoCompleteOption[] = [
      { value: 'a', disabled: true },
      { value: 'b', disabled: true },
    ]
    expect(nextIndex(blocked, 0, 1)).toBe(-1)
  })

  it('answers nothing for an empty list', () => {
    expect(nextIndex([], 0, 1)).toBe(-1)
  })
})

describe('selectableIndex', () => {
  it('refuses disabled rows and holes', () => {
    const all = normalizeOptions(options)
    expect(selectableIndex(all, 0)).toBe(0)
    expect(selectableIndex(all, 1)).toBeUndefined()
    expect(selectableIndex(all, 9)).toBeUndefined()
  })
})
