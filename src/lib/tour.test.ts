import { describe, expect, it } from 'vitest'
import {
  centreCard,
  clamp,
  maskRects,
  placeCard,
  spotlightRect,
  type Rect,
} from './tour'

const hole: Rect = { top: 200, left: 300, width: 120, height: 40 }
const card = { width: 300, height: 160 }
const viewport = { width: 1200, height: 800 }

describe('spotlightRect', () => {
  it('grows the box in every direction', () => {
    expect(spotlightRect(hole, 8)).toEqual({
      top: 192,
      left: 292,
      width: 136,
      height: 56,
    })
  })

  it('tolerates no padding', () => {
    expect(spotlightRect(hole, 0)).toEqual(hole)
  })
})

describe('maskRects', () => {
  it('returns the four bands around the hole', () => {
    const [above, below, left, right] = maskRects(hole, viewport)

    expect(above).toEqual({ top: 0, left: 0, width: 1200, height: 200 })
    expect(below).toEqual({ top: 240, left: 0, width: 1200, height: 560 })
    expect(left).toEqual({ top: 200, left: 0, width: 300, height: 40 })
    expect(right).toEqual({ top: 200, left: 420, width: 780, height: 40 })
  })

  it('never returns negative sizes', () => {
    const offscreen: Rect = { top: -50, left: -20, width: 60, height: 30 }
    const bands = maskRects(offscreen, viewport)

    expect(bands.every((band) => band.width >= 0 && band.height >= 0)).toBe(true)
  })
})

describe('clamp', () => {
  it('holds a value inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(50, 0, 10)).toBe(10)
  })

  it('prefers the floor when the range is inverted', () => {
    expect(clamp(5, 100, 10)).toBe(100)
  })
})

describe('placeCard', () => {
  it('sits under the target and centres on it', () => {
    const placed = placeCard(hole, card, viewport, { placement: 'bottom', gap: 12 })

    expect(placed.placement).toBe('bottom')
    expect(placed.top).toBe(200 + 40 + 12)
    expect(placed.left).toBe(300 + 60 - 150)
  })

  it('flips above when there is no room below', () => {
    const lowHole: Rect = { top: 700, left: 500, width: 100, height: 40 }
    const placed = placeCard(lowHole, card, viewport, { placement: 'bottom', gap: 12 })

    expect(placed.placement).toBe('top')
    expect(placed.top).toBe(700 - 12 - 160)
  })

  it('flips to the other side horizontally too', () => {
    const farLeft: Rect = { top: 300, left: 20, width: 60, height: 40 }
    const placed = placeCard(farLeft, card, viewport, { placement: 'left', gap: 12 })

    expect(placed.placement).toBe('right')
    expect(placed.left).toBe(80 + 12)
  })

  it('flips away from the edge and stays inside the viewport', () => {
    const nearRight: Rect = { top: 300, left: 1100, width: 80, height: 40 }
    const placed = placeCard(nearRight, card, viewport, { placement: 'right', gap: 12 })

    expect(placed.placement).toBe('left')
    expect(placed.left).toBe(1100 - 12 - 300)
  })

  it('gives up centring and pins to the margin when the card is too wide', () => {
    const placed = placeCard(hole, { width: 1400, height: 200 }, viewport)

    expect(placed.left).toBe(12)
    expect(placed.top).toBeGreaterThanOrEqual(12)
  })

  it('respects a wider margin', () => {
    const placed = placeCard(hole, card, viewport, { placement: 'bottom', margin: 40 })
    expect(placed.top).toBeGreaterThanOrEqual(40)
  })

  it('keeps the requested side when it fits', () => {
    const placed = placeCard(hole, card, viewport, { placement: 'right', gap: 12 })

    expect(placed.placement).toBe('right')
    expect(placed.left).toBe(300 + 120 + 12)
  })
})

describe('centreCard', () => {
  it('puts the card in the middle of the screen', () => {
    expect(centreCard(card, viewport)).toEqual({ top: 320, left: 450 })
  })
})
