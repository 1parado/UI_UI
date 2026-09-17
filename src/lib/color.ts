/**
 * Colour maths for `ColorPicker`.
 *
 * Kept as plain functions in `lib` rather than inside the component because
 * the conversions are the fiddly part and are worth testing on their own —
 * nothing here touches React or the DOM.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsv {
  /** Hue in degrees, 0–360. */
  h: number
  /** Saturation, 0–1. */
  s: number
  /** Value (brightness), 0–1. */
  v: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const toHexPair = (value: number) =>
  clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')

/** `{ r: 255, g: 128, b: 0 }` → `'#ff8000'`. Alpha is dropped. */
export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`
}

/**
 * Accepts `#rgb`, `#rrggbb`, and the same without the hash. Returns `null` for
 * anything else so callers can leave a half-typed field alone instead of
 * snapping the value around while the user is still typing.
 */
export function parseHex(input: string): Rgb | null {
  let body = input.trim().replace(/^#/, '')

  if (/^[0-9a-f]{3}$/i.test(body)) {
    body = body
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (!/^[0-9a-f]{6}$/i.test(body)) return null

  return {
    r: parseInt(body.slice(0, 2), 16),
    g: parseInt(body.slice(2, 4), 16),
    b: parseInt(body.slice(4, 6), 16),
  }
}

/** Hue in degrees; saturation and value in 0–1. */
export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6
    else if (max === green) h = (blue - red) / delta + 2
    else h = (red - green) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: max === 0 ? 0 : delta / max, v: max }
}

/** Rounded to whole 0–255 channels, which is what a hex string can hold. */
export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hue = ((h % 360) + 360) % 360
  const chroma = v * s
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const offset = v - chroma

  let rgb: [number, number, number]
  if (hue < 60) rgb = [chroma, second, 0]
  else if (hue < 120) rgb = [second, chroma, 0]
  else if (hue < 180) rgb = [0, chroma, second]
  else if (hue < 240) rgb = [0, second, chroma]
  else if (hue < 300) rgb = [second, 0, chroma]
  else rgb = [chroma, 0, second]

  return {
    r: Math.round((rgb[0] + offset) * 255),
    g: Math.round((rgb[1] + offset) * 255),
    b: Math.round((rgb[2] + offset) * 255),
  }
}

export function hexToHsv(hex: string): Hsv | null {
  const rgb = parseHex(hex)
  return rgb ? rgbToHsv(rgb) : null
}

/**
 * Relative luminance per WCAG, used to pick a legible ink colour for a swatch
 * whose background the caller chose.
 */
export function readableInk(hex: string): '#000000' | '#ffffff' {
  const rgb = parseHex(hex)
  if (!rgb) return '#000000'

  const channel = (value: number) => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }

  const luminance =
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)

  return luminance > 0.179 ? '#000000' : '#ffffff'
}

/**
 * A neutral-heavy default palette. Deliberately mixes greys with hues so the
 * swatch grid is useful for text and surfaces, not just for accents —
 * `ColorPicker` is as likely to be picking a chart series colour as a brand
 * colour.
 */
export const DEFAULT_COLOR_PRESETS = [
  '#000000',
  '#404040',
  '#737373',
  '#a3a3a3',
  '#d4d4d4',
  '#ffffff',
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#059669',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#7c3aed',
  '#9333ea',
  '#c026d3',
  '#db2777',
] as const
