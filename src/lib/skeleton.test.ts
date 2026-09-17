import { describe, expect, it } from 'vitest'
import { avatarSizes, columnWidths, paragraphWidths } from './skeleton'

describe('paragraphWidths', () => {
  it('runs every line but the last full width', () => {
    expect(paragraphWidths(3, 60)).toEqual([100, 100, 60])
  })

  it('accepts a custom last line', () => {
    expect(paragraphWidths(4, 35)).toEqual([100, 100, 100, 35])
  })

  it('treats a single line as the last one', () => {
    expect(paragraphWidths(1, 50)).toEqual([50])
  })

  it('answers nothing for a nonsense count', () => {
    expect(paragraphWidths(0)).toEqual([])
    expect(paragraphWidths(-3)).toEqual([])
    expect(paragraphWidths(Number.NaN)).toEqual([])
  })

  it('ignores the fraction of a fractional count', () => {
    expect(paragraphWidths(2.7)).toHaveLength(2)
  })
})

describe('columnWidths', () => {
  it('gives the first column its own share', () => {
    expect(columnWidths(3)).toEqual([40, 30, 30])
  })

  it('hands a single column the whole row', () => {
    expect(columnWidths(1)).toEqual([100])
  })

  it('shares the remainder evenly however many columns there are', () => {
    const widths = columnWidths(5, 20)
    expect(widths[0]).toBe(20)
    expect(widths.reduce((total, width) => total + width, 0)).toBeCloseTo(100)
  })

  it('answers nothing for a nonsense count', () => {
    expect(columnWidths(0)).toEqual([])
    expect(columnWidths(Number.NaN)).toEqual([])
  })
})

describe('avatarSizes', () => {
  it('grows from small to large', () => {
    expect(avatarSizes.sm).toBeLessThan(avatarSizes.md)
    expect(avatarSizes.md).toBeLessThan(avatarSizes.lg)
  })
})
