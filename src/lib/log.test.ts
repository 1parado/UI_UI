import { describe, expect, it } from 'vitest'
import { LOG_LEVELS, countLevels, parseLogLevel } from './log'

describe('parseLogLevel', () => {
  it('reads a bracketed level', () => {
    expect(parseLogLevel('[ERROR] something failed')).toBe('error')
  })

  it('reads a level after a timestamp', () => {
    expect(parseLogLevel('2026-09-17T09:20:21Z WARN slow query')).toBe('warn')
  })

  it('reads a level followed by a colon', () => {
    expect(parseLogLevel('error: connection refused')).toBe('error')
  })

  it('reads a key=value level', () => {
    expect(parseLogLevel('level=debug message')).toBe('debug')
  })

  it('is not fooled by a level word inside a longer word', () => {
    expect(parseLogLevel('information about the request')).toBe('info')
    expect(parseLogLevel('erroring out')).toBeUndefined()
  })

  it('maps the spellings that mean the same level', () => {
    expect(parseLogLevel('WARNING: disk almost full')).toBe('warn')
    expect(parseLogLevel('CRITICAL: out of memory')).toBe('fatal')
    expect(parseLogLevel('verbose trace enabled')).toBe('trace')
  })

  it('has no level for a plain message', () => {
    expect(parseLogLevel('listening on port 3000')).toBeUndefined()
    expect(parseLogLevel('3 errors found')).toBeUndefined()
  })

  it('only reads the head of a line', () => {
    const long = 'x'.repeat(80) + ' ERROR happened'
    expect(parseLogLevel(long)).toBeUndefined()
  })

  it('returns undefined for empty text', () => {
    expect(parseLogLevel('')).toBeUndefined()
  })
})

describe('countLevels', () => {
  it('counts each level and the total', () => {
    const counts = countLevels(['INFO a', 'INFO b', 'ERROR c', 'plain'])

    expect(counts).toMatchObject({ info: 2, error: 1, warn: 0, total: 4 })
  })

  it('reports nothing for no lines', () => {
    expect(countLevels([]).total).toBe(0)
  })

  it('orders the levels from least to most severe', () => {
    expect(LOG_LEVELS).toEqual(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
  })
})
