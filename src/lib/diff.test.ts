import { describe, expect, it } from 'vitest'
import {
  diffLines,
  diffStats,
  hasChanges,
  splitLines,
  toHunks,
  toSplitRows,
} from './diff'

/** `l1` … `l20`, so a test can name the lines it moves around. */
const line = (n: number) => `line ${n}`
const file = (count: number, replace: Record<number, string> = {}) =>
  Array.from({ length: count }, (_, index) => replace[index + 1] ?? line(index + 1)).join('\n')

describe('splitLines', () => {
  it('has no lines for empty text', () => {
    expect(splitLines('')).toEqual([])
  })

  it('does not invent a last line for a trailing newline', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b'])
  })

  it('keeps a genuine blank line at the end', () => {
    expect(splitLines('a\n\n')).toEqual(['a', ''])
  })

  it('normalises CRLF', () => {
    expect(splitLines('a\r\nb\r')).toEqual(['a', 'b'])
  })
})

describe('diffLines', () => {
  it('reports nothing for identical text', () => {
    const lines = diffLines(file(3), file(3))

    expect(lines.every((entry) => entry.type === 'context')).toBe(true)
    expect(hasChanges(lines)).toBe(false)
  })

  it('numbers both sides on context lines', () => {
    const lines = diffLines('a\nb', 'a\nb')

    expect(lines).toMatchObject([
      { type: 'context', oldLine: 1, newLine: 1 },
      { type: 'context', oldLine: 2, newLine: 2 },
    ])
  })

  it('marks an insertion as an addition with only a new line number', () => {
    const lines = diffLines('a\nc', 'a\nb\nc')
    const added = lines.filter((entry) => entry.type === 'add')

    expect(added).toEqual([{ type: 'add', text: 'b', newLine: 2 }])
    // The context after it is line 3 on the new side but still 2 on the old.
    expect(lines[lines.length - 1]).toMatchObject({ oldLine: 2, newLine: 3 })
  })

  it('marks a deletion as a removal with only an old line number', () => {
    const lines = diffLines('a\nb\nc', 'a\nc')

    expect(lines.filter((entry) => entry.type === 'remove')).toEqual([
      { type: 'remove', text: 'b', oldLine: 2 },
    ])
  })

  it('pairs a changed line into one removal and one addition', () => {
    const lines = diffLines(file(3), file(3, { 2: 'changed' }))

    expect(diffStats(lines)).toEqual({ added: 1, removed: 1 })
    expect(lines[1]).toMatchObject({ type: 'remove', text: line(2), oldLine: 2 })
    expect(lines[2]).toMatchObject({ type: 'add', text: 'changed', newLine: 2 })
  })

  it('keeps the untouched head and tail as context', () => {
    const lines = diffLines(file(20), file(20, { 11: 'changed' }))
    const first = lines[0]
    const last = lines[lines.length - 1]

    expect(first).toMatchObject({ type: 'context', text: line(1), oldLine: 1, newLine: 1 })
    expect(last).toMatchObject({ type: 'context', text: line(20), oldLine: 20, newLine: 20 })
  })

  it('treats an empty file as one big addition', () => {
    const lines = diffLines('', 'a\nb')

    expect(diffStats(lines)).toEqual({ added: 2, removed: 0 })
    expect(lines.map((entry) => entry.newLine)).toEqual([1, 2])
  })

  it('treats an emptied file as one big removal', () => {
    const lines = diffLines('a\nb', '')

    expect(diffStats(lines)).toEqual({ added: 0, removed: 2 })
    expect(lines.every((entry) => entry.oldLine !== undefined)).toBe(true)
  })

  it('renumbers correctly across several scattered edits', () => {
    const before = file(10)
    const after = file(10, { 1: 'first', 5: 'fifth', 10: 'last' })
    const lines = diffLines(before, after)

    expect(diffStats(lines)).toEqual({ added: 3, removed: 3 })
    // Line numbers stay in step on the context lines, despite three edits.
    for (const entry of lines) {
      if (entry.type === 'context') expect(entry.oldLine).toBe(entry.newLine)
    }
  })

  it('falls back to a whole-block rewrite when the change is too large to align', () => {
    const before = Array.from({ length: 1300 }, (_, index) => `a${index}`).join('\n')
    const after = Array.from({ length: 1300 }, (_, index) => `b${index}`).join('\n')
    const lines = diffLines(before, after)

    expect(diffStats(lines)).toEqual({ added: 1300, removed: 1300 })
    expect(lines[0].type).toBe('remove')
    expect(lines[1299].type).toBe('remove')
    expect(lines[1300].type).toBe('add')
  })
})

describe('toHunks', () => {
  it('has no hunks when nothing changed', () => {
    expect(toHunks(diffLines(file(10), file(10)))).toEqual([])
  })

  it('keeps the requested context on either side of a change', () => {
    const lines = diffLines(file(20), file(20, { 11: 'changed' }))
    const hunks = toHunks(lines, 3)

    expect(hunks).toHaveLength(1)
    expect(hunks[0].lines).toHaveLength(8) // 3 before + change + 3 after (change is 2 rows)
    expect(hunks[0]).toMatchObject({ oldStart: 8, newStart: 8, added: 1, removed: 1 })
    expect(hunks[0].hidden).toHaveLength(7)
    // The six lines after the hunk are elided by the renderer, not the hunk.
    expect(lines.slice(hunks[0].endIndex + 1)).toHaveLength(6)
  })

  it('starts the first hunk at the top, with nothing hidden', () => {
    const lines = diffLines(file(10, { 1: 'changed' }), file(10))
    const hunks = toHunks(lines, 3)

    expect(hunks[0].hidden).toEqual([])
    expect(hunks[0].startIndex).toBe(0)
  })

  it('splits two distant changes into two hunks', () => {
    const lines = diffLines(file(30), file(30, { 3: 'a', 28: 'b' }))
    const hunks = toHunks(lines, 2)

    expect(hunks).toHaveLength(2)
    expect(hunks[1].hidden.length).toBeGreaterThan(0)
    expect(hunks[1].hidden.every((entry) => entry.type === 'context')).toBe(true)
  })

  it('merges two nearby changes into one hunk', () => {
    const lines = diffLines(file(30), file(30, { 10: 'a', 13: 'b' }))
    const hunks = toHunks(lines, 3)

    expect(hunks).toHaveLength(1)
  })

  it('drops context entirely at zero', () => {
    const lines = diffLines(file(20), file(20, { 11: 'changed' }))
    const hunks = toHunks(lines, 0)

    expect(hunks[0].lines.every((entry) => entry.type !== 'context')).toBe(true)
  })

  it('counts old and new lines separately for an insertion', () => {
    const lines = diffLines('a\nb', 'a\nnew\nb')
    const hunks = toHunks(lines, 1)

    expect(hunks[0]).toMatchObject({ added: 1, removed: 0, oldCount: 2, newCount: 3 })
  })
})

describe('toSplitRows', () => {
  it('puts a context line on both sides', () => {
    const rows = toSplitRows(diffLines('a', 'a'))

    expect(rows[0].left).toBe(rows[0].right)
  })

  it('zips a removal with the addition that replaced it', () => {
    const rows = toSplitRows(diffLines('old', 'new'))

    expect(rows[0].left).toMatchObject({ type: 'remove', text: 'old' })
    expect(rows[0].right).toMatchObject({ type: 'add', text: 'new' })
  })

  it('pads the side that is short when a run grows', () => {
    const rows = toSplitRows(diffLines('a\nb\nc', 'a\nX\nb\nY\nc'))
    const padded = rows.filter((row) => !row.left || !row.right)

    // Each insertion is its own run, since a context line separates them.
    expect(padded).toHaveLength(2)
    expect(padded.every((row) => row.left === undefined)).toBe(true)
    expect(rows.filter((row) => row.left && row.right)).toHaveLength(3)
  })

  it('keeps both columns in step so a row index means the same thing on each side', () => {
    const rows = toSplitRows(diffLines(file(5), file(5, { 2: 'changed', 3: 'removed' })))

    expect(rows).toHaveLength(5)
    expect(rows[4].left).toMatchObject({ type: 'context', oldLine: 5 })
    expect(rows[4].right).toMatchObject({ type: 'context', newLine: 5 })
  })
})
