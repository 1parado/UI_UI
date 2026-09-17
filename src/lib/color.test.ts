import { describe, expect, it } from 'vitest'
import {
  DEFAULT_COLOR_PRESETS,
  hexToHsv,
  hsvToRgb,
  parseHex,
  readableInk,
  rgbToHex,
  rgbToHsv,
} from './color'

describe('parseHex', () => {
  it('reads the six-digit form', () => {
    expect(parseHex('#ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('accepts the value without the hash', () => {
    expect(parseHex('ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('expands the three-digit shorthand', () => {
    expect(parseHex('#f80')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('is case-insensitive and trims', () => {
    expect(parseHex('  #FF8800 ')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('returns null for anything else', () => {
    // Half-typed input has to be rejected rather than guessed at, or the field
    // would snap to a wrong colour while the user is still typing.
    expect(parseHex('#ff88')).toBeNull()
    expect(parseHex('#gggggg')).toBeNull()
    expect(parseHex('')).toBeNull()
  })
})

describe('rgbToHex', () => {
  it('pads single-digit channels', () => {
    expect(rgbToHex({ r: 0, g: 8, b: 255 })).toBe('#0008ff')
  })

  it('rounds fractional channels', () => {
    expect(rgbToHex({ r: 254.6, g: 0, b: 0 })).toBe('#ff0000')
  })

  it('clamps channels outside the byte range', () => {
    expect(rgbToHex({ r: 300, g: -5, b: 0 })).toBe('#ff0000')
  })
})

describe('rgbToHsv', () => {
  it('puts red at hue zero with full saturation', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 })
  })

  it('gives white no saturation', () => {
    const white = rgbToHsv({ r: 255, g: 255, b: 255 })
    expect(white.s).toBe(0)
    expect(white.v).toBe(1)
  })

  it('gives black no value', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 })
  })

  it('reports a hue in the second half of the wheel without going negative', () => {
    const magenta = rgbToHsv({ r: 255, g: 0, b: 255 })
    expect(magenta.h).toBeCloseTo(300, 5)
  })
})

describe('hsvToRgb', () => {
  it('wraps a hue past a full turn', () => {
    expect(hsvToRgb({ h: 360, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('wraps a negative hue', () => {
    expect(hsvToRgb({ h: -120, s: 1, v: 1 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('returns white at full value and no saturation regardless of hue', () => {
    expect(hsvToRgb({ h: 210, s: 0, v: 1 })).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('round trips', () => {
  const samples = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#2563eb', '#a3a3a3']

  it.each(samples)('keeps %s stable through HSV', (hex) => {
    const hsv = hexToHsv(hex)
    expect(hsv).not.toBeNull()
    expect(rgbToHex(hsvToRgb(hsv!))).toBe(hex)
  })
})

describe('readableInk', () => {
  it('picks black on a light swatch', () => {
    expect(readableInk('#ffffff')).toBe('#000000')
  })

  it('picks white on a dark swatch', () => {
    expect(readableInk('#111827')).toBe('#ffffff')
  })
})

describe('DEFAULT_COLOR_PRESETS', () => {
  it('are all parseable', () => {
    for (const preset of DEFAULT_COLOR_PRESETS) {
      expect(parseHex(preset), preset).not.toBeNull()
    }
  })
})
