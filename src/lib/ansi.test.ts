import { describe, expect, it } from 'vitest'
import { ANSI_NAMED, paletteColor, parseAnsi, stripAnsi } from './ansi'

const esc = (sequence: string) => `\u001b[${sequence}`

describe('parseAnsi', () => {
  it('leaves plain text as one run', () => {
    expect(parseAnsi('hello world')).toEqual([{ text: 'hello world' }])
  })

  it('has nothing to say about an empty string', () => {
    expect(parseAnsi('')).toEqual([])
  })

  it('reads a named foreground colour', () => {
    const tokens = parseAnsi(`${esc('31m')}error${esc('0m')}`)

    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({ text: 'error', fg: { kind: 'palette', index: 1 } })
  })

  it('reads several attributes from one sequence', () => {
    const tokens = parseAnsi(`${esc('1;4;31m')}alert${esc('0m')}`)

    expect(tokens[0]).toMatchObject({ bold: true, underline: true })
  })

  it('reads a bright colour', () => {
    const tokens = parseAnsi(`${esc('90m')}dim grey`)

    expect(tokens[0].fg).toEqual({ kind: 'palette', index: 8 })
  })

  it('reads a background colour independently of the foreground', () => {
    const tokens = parseAnsi(`${esc('41;97m')}selected`)

    expect(tokens[0]).toMatchObject({
      fg: { kind: 'palette', index: 15 },
      bg: { kind: 'palette', index: 1 },
    })
  })

  it('reads a 256-colour index', () => {
    const tokens = parseAnsi(`${esc('38;5;196m')}orange`)

    expect(tokens[0].fg).toEqual({ kind: 'palette', index: 196 })
  })

  it('reads a 24-bit colour as a literal', () => {
    const tokens = parseAnsi(`${esc('38;2;10;20;30m')}custom`)

    expect(tokens[0].fg).toEqual({ kind: 'rgb', hex: '#0a141e' })
  })

  it('reads reverse video', () => {
    expect(parseAnsi(`${esc('7m')}inverse`)[0].inverse).toBe(true)
  })

  it('keeps the text after a colour change in the new style', () => {
    const tokens = parseAnsi(`${esc('32m')}ok ${esc('31m')}bad`)

    expect(tokens).toHaveLength(2)
    expect(tokens[0]).toMatchObject({ text: 'ok ', fg: { kind: 'palette', index: 2 } })
    expect(tokens[1]).toMatchObject({ text: 'bad', fg: { kind: 'palette', index: 1 } })
  })

  it('merges runs that share a style', () => {
    const tokens = parseAnsi(`${esc('31m')}a${esc('31m')}b`)

    expect(tokens).toEqual([{ text: 'ab', fg: { kind: 'palette', index: 1 } }])
  })

  it('drops the style again on a reset', () => {
    const tokens = parseAnsi(`${esc('1;31m')}red${esc('0m')} plain`)

    expect(tokens[0]).toMatchObject({ bold: true, text: 'red' })
    expect(tokens[1]).toEqual({ text: ' plain' })
  })

  it('turns bold and dim back off', () => {
    const tokens = parseAnsi(`${esc('1m')}a${esc('22m')}b`)

    expect(tokens).toHaveLength(2)
    expect(tokens[1].bold).toBeUndefined()
  })

  it('restores the default foreground', () => {
    const tokens = parseAnsi(`${esc('31m')}a${esc('39m')}b`)

    expect(tokens[1].fg).toBeUndefined()
  })

  it('swallows cursor and erase sequences instead of printing them', () => {
    expect(parseAnsi(`${esc('2K')}${esc('1G')}progress`)).toEqual([{ text: 'progress' }])
  })

  it('swallows an OSC window-title sequence', () => {
    expect(parseAnsi('\u001b]0;a title\u0007line')).toEqual([{ text: 'line' }])
  })

  it('drops carriage returns, which a scrolled log cannot honour', () => {
    expect(parseAnsi('50%\r100%')).toEqual([{ text: '50%100%' }])
  })

  it('ignores an unknown SGR code', () => {
    expect(parseAnsi(`${esc('999m')}x`)).toEqual([{ text: 'x' }])
  })

  it('drops a truncate escape rather than leaking the ESC', () => {
    expect(parseAnsi('a\u001b')).toEqual([{ text: 'a' }])
    expect(parseAnsi(`a${esc('3')}`)).toEqual([{ text: 'a' }])
  })

  it('starts every line from the default style', () => {
    // A style must not leak from one call into the next: a log renders lines
    // independently, and a colour left open at the end of one line is a bug in
    // the program that wrote it, not something to carry forward.
    parseAnsi(`${esc('31m')}unterminated`)
    expect(parseAnsi('next line')).toEqual([{ text: 'next line' }])
  })
})

describe('stripAnsi', () => {
  it('returns the visible text', () => {
    expect(stripAnsi(`${esc('1;32m')}done${esc('0m')} in 2s`)).toBe('done in 2s')
  })
})

describe('paletteColor', () => {
  it('maps the named colours onto theme variables', () => {
    expect(ANSI_NAMED).toHaveLength(16)
    expect(paletteColor(0)).toBe('hsl(var(--ansi-black))')
    expect(paletteColor(1)).toBe('hsl(var(--ansi-red))')
    expect(paletteColor(15)).toBe('hsl(var(--ansi-bright-white))')
  })

  it('computes the 216-colour cube', () => {
    expect(paletteColor(16)).toBe('#000000')
    expect(paletteColor(17)).toBe('#00005f')
    expect(paletteColor(196)).toBe('#ff0000')
    expect(paletteColor(231)).toBe('#ffffff')
  })

  it('computes the greyscale ramp', () => {
    expect(paletteColor(232)).toBe('#080808')
    expect(paletteColor(255)).toBe('#eeeeee')
  })

  it('clamps an index outside the palette', () => {
    expect(paletteColor(-1)).toBe('hsl(var(--ansi-black))')
    expect(paletteColor(999)).toBe('#eeeeee')
  })
})
