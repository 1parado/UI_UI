/* eslint-disable no-control-regex -- matching control characters is the job here. */

/**
 * ANSI SGR parsing — the maths behind `Terminal` and `LogViewer`.
 *
 * Only the subset that appears in real program output is implemented:
 * the 16 named colours, the 256-colour palette, 24-bit colour, and the five
 * attribute flags. Cursor movement, erasing and OSC sequences are *recognised*
 * so they can be dropped rather than printed, which is what a log wants.
 *
 * The named colours resolve to `hsl(var(--ansi-*))` rather than to literals:
 * they are the ones a theme needs to be able to tune, and they are defined
 * once because the terminal surface stays dark in both themes.
 */

export type AnsiColor =
  | { kind: 'palette'; index: number }
  | { kind: 'rgb'; hex: string }

export interface AnsiToken {
  text: string
  fg?: AnsiColor
  bg?: AnsiColor
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
  /** Reverse video — the "selected line" look many CLIs use. */
  inverse?: boolean
}

/** The 16 named colours, in SGR order. Index 8–15 are the bright variants. */
export const ANSI_NAMED = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'bright-black',
  'bright-red',
  'bright-green',
  'bright-yellow',
  'bright-blue',
  'bright-magenta',
  'bright-cyan',
  'bright-white',
] as const

const CUBE_STEPS = [0, 95, 135, 175, 215, 255]

const hex = (value: number) => value.toString(16).padStart(2, '0')

function rgbHex(r: number, g: number, b: number): string {
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/**
 * A CSS colour for a palette index. 0–15 become theme variables, because those
 * are the colours a theme is expected to own; the 216-colour cube and the
 * 24-step greyscale above them are already absolute RGB values in the spec, so
 * they are emitted as literals.
 */
export function paletteColor(index: number): string {
  const safe = Math.max(0, Math.min(255, Math.trunc(index)))

  if (safe < 16) return `hsl(var(--ansi-${ANSI_NAMED[safe]}))`

  if (safe < 232) {
    const cube = safe - 16
    return rgbHex(
      CUBE_STEPS[Math.floor(cube / 36)],
      CUBE_STEPS[Math.floor((cube % 36) / 6)],
      CUBE_STEPS[cube % 6]
    )
  }

  const level = 8 + (safe - 232) * 10
  return rgbHex(level, level, level)
}

const OSC_PATTERN = /\u001b\][\s\S]*?(?:\u0007|\u001b\\)/g
const CSI_PATTERN = /\u001b\[([0-9;?]*)([A-Za-z])/g

interface Style {
  fg?: AnsiColor
  bg?: AnsiColor
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
  inverse?: boolean
}

const styleKey = (style: Style) =>
  [
    style.fg ? `f${'index' in style.fg ? style.fg.index : style.fg.hex}` : '',
    style.bg ? `b${'index' in style.bg ? style.bg.index : style.bg.hex}` : '',
    style.bold ? 'B' : '',
    style.dim ? 'D' : '',
    style.italic ? 'I' : '',
    style.underline ? 'U' : '',
    style.inverse ? 'V' : '',
  ].join('|')

/** Reads a `38;…` / `48;…` payload. Returns the colour and the next index. */
function readExtended(
  codes: number[],
  start: number
): { color: AnsiColor; next: number } | null {
  const mode = codes[start + 1]

  if (mode === 5) {
    const index = codes[start + 2]
    if (!Number.isFinite(index)) return null
    return { color: { kind: 'palette', index }, next: start + 3 }
  }

  if (mode === 2) {
    const [r, g, b] = [codes[start + 2], codes[start + 3], codes[start + 4]]
    if (![r, g, b].every(Number.isFinite)) return null
    return { color: { kind: 'rgb', hex: rgbHex(r, g, b) }, next: start + 5 }
  }

  return null
}

function applySgr(style: Style, params: string): Style {
  const next: Style =
    params === '' ? {} : { ...style }
  const codes = params === '' ? [0] : params.split(';').map((part) => Number(part || 0))

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i]

    if (code === 38 || code === 48) {
      const extended = readExtended(codes, i)
      if (extended) {
        if (code === 38) next.fg = extended.color
        else next.bg = extended.color
        i = extended.next - 1
      }
      continue
    }

    switch (code) {
      case 0:
        return {}
      case 1:
        next.bold = true
        break
      case 2:
        next.dim = true
        break
      case 3:
        next.italic = true
        break
      case 4:
        next.underline = true
        break
      case 7:
        next.inverse = true
        break
      case 22:
        next.bold = undefined
        next.dim = undefined
        break
      case 23:
        next.italic = undefined
        break
      case 24:
        next.underline = undefined
        break
      case 27:
        next.inverse = undefined
        break
      case 39:
        next.fg = undefined
        break
      case 49:
        next.bg = undefined
        break
      default:
        if (code >= 30 && code <= 37) next.fg = { kind: 'palette', index: code - 30 }
        else if (code >= 90 && code <= 97) next.fg = { kind: 'palette', index: code - 90 + 8 }
        else if (code >= 40 && code <= 47) next.bg = { kind: 'palette', index: code - 40 }
        else if (code >= 100 && code <= 107) next.bg = { kind: 'palette', index: code - 100 + 8 }
        break
    }
  }

  return next
}

/**
 * Parse one line of terminal output into styled runs.
 *
 * Rules worth knowing:
 * - Consecutive runs with the same style are merged, so a coloured word is one
 *   `<span>` rather than one per escape.
 * - Carriage returns are dropped. A real terminal overwrites the line with
 *   them (progress bars); a scrolled-back log cannot, and printing the raw
 *   character would corrupt the text.
 * - Unknown SGR codes are ignored, and non-SGR CSI sequences are consumed
 *   silently instead of leaking `[2K` into the output.
 * - A style carries across the line's runs but not across calls: each line
 *   starts from the default style, which is what a log needs.
 */
export function parseAnsi(input: string): AnsiToken[] {
  const text = input
    .replace(OSC_PATTERN, '')
    // A lone ESC — or the start of an OSC we did not recognise — is dropped
    // rather than printed.
    .replace(/\u001b(?!\[)/g, '')
    // A sequence cut off mid-write (the writer died, the buffer was sliced).
    .replace(/\u001b\[[0-9;?]*$/, '')
    .replace(/\r/g, '')
  const tokens: AnsiToken[] = []
  let style: Style = {}
  let lastKey: string | null = null
  let cursor = 0
  let match: RegExpExecArray | null

  const push = (chunk: string, key: string) => {
    if (!chunk) return
    const last = tokens[tokens.length - 1]
    if (last && key === lastKey) {
      last.text += chunk
      return
    }
    tokens.push({ ...style, text: chunk })
    lastKey = key
  }

  const pattern = new RegExp(CSI_PATTERN.source, 'g')
  while ((match = pattern.exec(text)) !== null) {
    push(text.slice(cursor, match.index), styleKey(style))
    cursor = match.index + match[0].length
    if (match[2] === 'm') style = applySgr(style, match[1])
  }
  push(text.slice(cursor), styleKey(style))

  return tokens
}

/** The visible text of a line, escapes removed. */
export function stripAnsi(input: string): string {
  return parseAnsi(input)
    .map((token) => token.text)
    .join('')
}
