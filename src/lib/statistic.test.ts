import { describe, expect, it } from 'vitest'
import {
  formatStatisticValue,
  groupDigits,
  interpolateStatistic,
} from './statistic'

describe('groupDigits', () => {
  it('thins a long number out with separators', () => {
    expect(groupDigits('1234567')).toBe('1,234,567')
    expect(groupDigits('123')).toBe('123')
    expect(groupDigits('1')).toBe('1')
  })

  it('honours the requested separator', () => {
    expect(groupDigits('1234567', ' ')).toBe('1 234 567')
    expect(groupDigits('1234567', '.')).toBe('1.234.567')
  })

  it('returns the digits untouched with an empty separator', () => {
    expect(groupDigits('1234567', '')).toBe('1234567')
  })
})

describe('formatStatisticValue', () => {
  it('groups thousands by default', () => {
    expect(formatStatisticValue(1234567)).toBe('1,234,567')
  })

  it('keeps the requested decimals', () => {
    expect(formatStatisticValue(1234.5678, { precision: 2 })).toBe('1,234.57')
    expect(formatStatisticValue(1234, { precision: 2 })).toBe('1,234.00')
  })

  it('uses the separators it is given', () => {
    expect(
      formatStatisticValue(1234.5, {
        precision: 1,
        groupSeparator: ' ',
        decimalSeparator: ',',
      })
    ).toBe('1 234,5')
  })

  it('puts the minus sign after the prefix', () => {
    expect(formatStatisticValue(-1204.5, { precision: 2, prefix: '¥' })).toBe('¥-1,204.50')
  })

  it('appends the suffix untouched', () => {
    expect(formatStatisticValue(12.4, { precision: 1, suffix: ' / mo' })).toBe('12.4 / mo')
  })

  it('rounds rather than truncating', () => {
    expect(formatStatisticValue(0.9)).toBe('1')
    expect(formatStatisticValue(2.5)).toBe('3')
  })

  it('reads non-numbers as the fallback', () => {
    expect(formatStatisticValue(Number.NaN)).toBe('—')
    expect(formatStatisticValue(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatStatisticValue(Number.NaN, { fallback: 'n/a' })).toBe('n/a')
  })

  it('leaves zero alone', () => {
    expect(formatStatisticValue(0)).toBe('0')
    expect(formatStatisticValue(-0)).toBe('0')
  })

  it('stays honest at the edges of a 64-bit float', () => {
    expect(formatStatisticValue(0.1 + 0.2, { precision: 2 })).toBe('0.30')
  })
})

describe('interpolateStatistic', () => {
  it('starts at `from` and ends at `to`', () => {
    expect(interpolateStatistic(0, 100, 0)).toBe(0)
    expect(interpolateStatistic(0, 100, 1)).toBe(100)
  })

  it('moves faster early, so the number settles at the end', () => {
    const halfway = interpolateStatistic(0, 100, 0.5)
    expect(halfway).toBeGreaterThan(50)
  })

  it('clamps progress rather than overshooting', () => {
    expect(interpolateStatistic(0, 100, 2)).toBe(100)
    expect(interpolateStatistic(0, 100, -1)).toBe(0)
  })
})
