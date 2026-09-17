import { describe, expect, it } from 'vitest'
import { pickActiveAnchor, scrollTargetFor, type AnchorSection } from './anchor'

const sections: AnchorSection[] = [
  { id: 'intro', top: 0 },
  { id: 'install', top: 420 },
  { id: 'usage', top: 1300 },
  { id: 'api', top: 2600 },
]

describe('pickActiveAnchor', () => {
  it('reports the first section before any of them are reached', () => {
    expect(pickActiveAnchor(sections, 0)).toBe('intro')
  })

  it('switches at the boundary, not before it', () => {
    expect(pickActiveAnchor(sections, 419)).toBe('intro')
    expect(pickActiveAnchor(sections, 420)).toBe('install')
  })

  it('reports the deepest section passed', () => {
    expect(pickActiveAnchor(sections, 1400)).toBe('usage')
    expect(pickActiveAnchor(sections, 2599)).toBe('usage')
    expect(pickActiveAnchor(sections, 2600)).toBe('api')
  })

  it('honours a sticky header by moving the reading line down', () => {
    // At 400 with a 64px header the line is at 464 — past "install" (420).
    expect(pickActiveAnchor(sections, 400, 0)).toBe('intro')
    expect(pickActiveAnchor(sections, 400, 64)).toBe('install')
  })

  it('has nothing to report with no sections', () => {
    expect(pickActiveAnchor([], 500)).toBeUndefined()
  })

  it('does not depend on the sections being reachable by scrolling', () => {
    expect(pickActiveAnchor(sections, 99_999)).toBe('api')
  })
})

describe('scrollTargetFor', () => {
  it('lifts the section clear of a sticky header', () => {
    expect(scrollTargetFor(1300, 64, 5000)).toBe(1236)
  })

  it('never returns a negative scroll', () => {
    expect(scrollTargetFor(0, 64, 5000)).toBe(0)
  })

  it('clamps to the end of the container', () => {
    // The last section sits at 2600 but the document only scrolls to 2200 —
    // scrolling to 2536 would be ignored, leaving "api" unreachable.
    expect(scrollTargetFor(2600, 64, 2200)).toBe(2200)
  })
})
