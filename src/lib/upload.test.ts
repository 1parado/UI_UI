import { describe, expect, it } from 'vitest'
import { describeAccept, matchesAccept, parseAccept } from './upload'

const file = (name: string, type = '') => ({ name, type })

describe('parseAccept', () => {
  it('splits extensions from MIME patterns', () => {
    expect(parseAccept('image/*,.pdf, text/plain ')).toEqual({
      extensions: ['.pdf'],
      mimeTypes: ['image/*', 'text/plain'],
    })
  })

  it('has nothing for an empty list', () => {
    expect(parseAccept()).toEqual({ extensions: [], mimeTypes: [] })
    expect(parseAccept('  ,  ')).toEqual({ extensions: [], mimeTypes: [] })
  })
})

describe('matchesAccept', () => {
  it('accepts anything when no list is given', () => {
    expect(matchesAccept(file('a.bin', 'application/octet-stream'))).toBe(true)
    expect(matchesAccept(file('a.bin'), '')).toBe(true)
  })

  it('matches a wildcard MIME type', () => {
    expect(matchesAccept(file('photo.png', 'image/png'), 'image/*')).toBe(true)
    expect(matchesAccept(file('notes.txt', 'text/plain'), 'image/*')).toBe(false)
  })

  it('matches an exact MIME type', () => {
    expect(matchesAccept(file('a.pdf', 'application/pdf'), 'application/pdf')).toBe(true)
  })

  it('matches an extension regardless of case', () => {
    expect(matchesAccept(file('SCAN.PDF', 'application/pdf'), '.pdf')).toBe(true)
  })

  it('accepts a file with no MIME type by extension', () => {
    // Browsers report an empty type for an unknown extension, which is exactly
    // the case a custom extension entry exists for.
    expect(matchesAccept(file('data.myext'), '.myext')).toBe(true)
  })

  it('does not accept a typed file that only differs by extension', () => {
    expect(matchesAccept(file('a.ts', 'video/mp2t'), '.ts')).toBe(true) // by name
    expect(matchesAccept(file('a.ts', 'video/mp2t'), 'image/*')).toBe(false)
  })

  it('rejects a file with no type against a MIME-only list', () => {
    expect(matchesAccept(file('data.myext'), 'image/*')).toBe(false)
  })

  it('accepts when any entry matches', () => {
    expect(matchesAccept(file('a.png', 'image/png'), '.pdf,.png')).toBe(true)
  })
})

describe('describeAccept', () => {
  it('reads like a hint', () => {
    expect(describeAccept('image/*,.pdf')).toBe('.pdf, image files')
  })

  it('is empty without a list', () => {
    expect(describeAccept()).toBe('')
  })
})
