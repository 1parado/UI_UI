import { describe, expect, it } from 'vitest'
import {
  CODE128_PATTERNS,
  canEncode,
  charValue,
  checksum,
  encodeCode128,
  moduleRuns,
  pairValue,
  totalModules,
} from './code128'

const bits = (widths: number[]) =>
  widths.map((width, index) => (index % 2 === 0 ? '1' : '0').repeat(width)).join('')

describe('the width table', () => {
  it('holds every symbol', () => {
    expect(CODE128_PATTERNS).toHaveLength(107)
  })

  it('makes every symbol 11 modules wide, apart from the stop', () => {
    CODE128_PATTERNS.forEach((pattern, value) => {
      const total = pattern.reduce((sum, width) => sum + width, 0)
      expect(total, `value ${value}`).toBe(value === 106 ? 13 : 11)
    })
  })

  it('keeps bars even and spaces odd in every data symbol', () => {
    // The parity pair is what lets a scanner check a symbol as it reads it, so
    // a transposed pair of widths would be caught here.
    CODE128_PATTERNS.forEach((pattern, value) => {
      if (value === 106) return

      const bars = pattern.filter((_, index) => index % 2 === 0).reduce((a, b) => a + b, 0)
      const spaces = pattern.filter((_, index) => index % 2 === 1).reduce((a, b) => a + b, 0)

      expect(bars % 2, `value ${value}`).toBe(0)
      expect(spaces % 2, `value ${value}`).toBe(1)
    })
  })

  it('matches the start and stop patterns scanners look for', () => {
    expect(bits(CODE128_PATTERNS[103])).toBe('11010000100')
    expect(bits(CODE128_PATTERNS[104])).toBe('11010010000')
    expect(bits(CODE128_PATTERNS[105])).toBe('11010011100')
    expect(bits(CODE128_PATTERNS[106])).toBe('1100011101011')
  })

  it('matches a character whose encoding is published independently', () => {
    // ASCII "0" is documented as 10011101100.
    expect(bits(CODE128_PATTERNS[16])).toBe('10011101100')
  })
})

describe('charValue', () => {
  it('maps printable ASCII in set B', () => {
    expect(charValue('A', 'B')).toBe(33)
    expect(charValue(' ', 'B')).toBe(0)
    expect(charValue('~', 'B')).toBe(94)
  })

  it('reaches further down in set A', () => {
    expect(charValue('\n', 'A')).toBe(74)
    expect(charValue('\u0000', 'A')).toBe(64)
  })

  it('refuses what a set cannot hold', () => {
    expect(charValue('a', 'A')).toBeNull()
    expect(charValue('é', 'B')).toBeNull()
    expect(canEncode('a', 'A')).toBe(false)
  })
})

describe('pairValue', () => {
  it('reads two digits as one symbol value', () => {
    expect(pairValue('47')).toBe(47)
    expect(pairValue('00')).toBe(0)
  })

  it('refuses anything that is not exactly two digits', () => {
    expect(pairValue('4')).toBeNull()
    expect(pairValue('abc')).toBeNull()
  })
})

describe('checksum', () => {
  it('follows the worked example in the specification', () => {
    // "ABCD1234" in set A: 33·1 + 34·2 + 35·3 + 36·4 + 17·5 + 18·6 + 19·7 + 20·8
    // = 836, plus the start's own 103, mod 103 = 12.
    expect(checksum(103, [33, 34, 35, 36, 17, 18, 19, 20])).toBe(12)
  })

  it('always answers between 0 and 102', () => {
    // A checksum takes values 0..102, so a start value above 102 wraps round.
    expect(checksum(105, [99, 99, 99, 99])).toBeLessThan(103)
    expect(checksum(104, [0])).toBe(1)
  })
})

describe('encodeCode128', () => {
  it('packs a purely numeric code into Code C', () => {
    const encoded = encodeCode128('12345678')

    expect(encoded?.codeSet).toBe('C')
    expect(encoded?.values[0]).toBe(105)
    expect(encoded?.data).toEqual([12, 34, 56, 78])
    expect(encoded?.values[encoded.values.length - 1]).toBe(106)
  })

  it('drops back to B for an odd trailing digit', () => {
    const encoded = encodeCode128('12345')

    // 12, 34, latches to B for the leftover 5, then 5 in set B.
    expect(encoded?.data).toEqual([12, 34, 100, 21])
  })

  it('latches into C for a long run of digits mid-string', () => {
    const encoded = encodeCode128('AB1234CD')

    expect(encoded?.codeSet).toBe('B')
    expect(encoded?.data).toEqual([33, 34, 99, 12, 34, 100, 35, 36])
  })

  it('leaves a short run of digits in the current set', () => {
    // Two digits do not pay for the latch that would be needed to reach them.
    expect(encodeCode128('AB12')?.data).toEqual([33, 34, 17, 18])
  })

  it('starts in A when the first character demands it', () => {
    const encoded = encodeCode128('\u0001')

    expect(encoded?.codeSet).toBe('A')
    expect(encoded?.values[0]).toBe(103)
    expect(encoded?.data).toEqual([65])
  })

  it('puts the checksum just before the stop', () => {
    const encoded = encodeCode128('12345678')
    const values = encoded?.values ?? []

    expect(values[values.length - 2]).toBe(encoded?.check)
    expect(checksum(105, encoded?.data ?? [])).toBe(encoded?.check)
  })

  it('answers null rather than drawing something unscannable', () => {
    expect(encodeCode128('中央厚生省')).toBeNull()
    expect(encodeCode128('')).toBeNull()
  })

  it('honours a set it was told to use', () => {
    expect(encodeCode128('abc', { codeSet: 'B' })?.codeSet).toBe('B')
    expect(encodeCode128('abc', { codeSet: 'B' })?.data).toEqual([65, 66, 67])
  })
})

describe('drawing measurements', () => {
  it('measures the whole symbol in modules', () => {
    const encoded = encodeCode128('12345678')
    const values = encoded?.values ?? []

    // Start, four data symbols and the checksum are 11 wide; the stop is 13.
    expect(totalModules(values)).toBe(11 * (values.length - 1) + 13)
  })

  it('returns alternating runs that start with a bar', () => {
    const runs = moduleRuns(encodeCode128('A')?.values ?? [])

    expect(runs[0]).toBe(2)
    expect(runs[1]).toBe(1)
    expect(runs.reduce((sum, width) => sum + width, 0)).toBe(11 * 3 + 13)
  })
})
