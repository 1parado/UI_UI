import { describe, expect, it } from 'vitest'
import { enUS, mergeLocale, zhCN } from './config'

describe('the bundled locales', () => {
  it('answer every key', () => {
    const keys = Object.keys(enUS)

    expect(Object.keys(zhCN)).toEqual(keys)
    const asRecord = (messages: typeof enUS) => messages as unknown as Record<string, unknown>
    const englishValues = asRecord(enUS)
    const chineseValues = asRecord(zhCN)

    for (const key of keys) {
      expect(englishValues[key], key).toBeDefined()
      expect(chineseValues[key], key).toBeDefined()
    }
  })

  it('count something in more than one word order', () => {
    expect(enUS.more(3)).toBe('3 more')
    expect(zhCN.more(3)).toBe('还有 3 项')
  })
})

describe('mergeLocale', () => {
  it('returns the base untouched when there is nothing to merge', () => {
    expect(mergeLocale(enUS, undefined)).toBe(enUS)
  })

  it('replaces only the keys it was given', () => {
    const merged = mergeLocale(enUS, { search: 'Find…' })

    expect(merged.search).toBe('Find…')
    expect(merged.empty).toBe(enUS.empty)
    expect(merged.more(2)).toBe('2 more')
  })
})
