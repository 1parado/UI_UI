/**
 * Line diffing — the maths behind `Diff` / `CodeDiff`.
 *
 * A plain longest-common-subsequence over lines. Real diff tools (Myers,
 * patience) exist for good reasons, but they matter at file sizes this
 * component is not for: a review panel of a few hundred lines. What does
 * matter at that size is that the answer is *stable* and cheap, so this
 * implementation trims the common prefix and suffix first — which is where
 * most of a real edit's lines live — and only runs the dynamic program over
 * the changed middle.
 */

export type DiffLineType = 'context' | 'add' | 'remove'

export interface DiffLine {
  type: DiffLineType
  text: string
  /** 1-based line number in the old text. Absent on added lines. */
  oldLine?: number
  /** 1-based line number in the new text. Absent on removed lines. */
  newLine?: number
}

export interface DiffStats {
  added: number
  removed: number
}

export interface DiffHunk extends DiffStats {
  /** Index of the first line this hunk covers in the full diff. */
  startIndex: number
  /** Index of the last line this hunk covers in the full diff. */
  endIndex: number
  /** First old-text line number this hunk covers, 1-based. */
  oldStart: number
  oldCount: number
  /** First new-text line number this hunk covers, 1-based. */
  newStart: number
  newCount: number
  /** Lines to draw under the hunk header. */
  lines: DiffLine[]
  /** Unchanged lines elided just above this hunk. Empty on the first hunk. */
  hidden: DiffLine[]
}

/** A row of a side-by-side view. One side is empty when the other is longer. */
export interface DiffSplitRow {
  left?: DiffLine
  right?: DiffLine
}

/**
 * Above this many cells the dynamic program is abandoned in favour of
 * "everything changed". 1.5M cells is a 1.5MB direction table and runs in
 * well under a second; a 3000×3000 line diff is not something a panel should
 * attempt anyway.
 */
const MAX_DP_CELLS = 1_500_000

/**
 * Split text into lines, dropping the single empty line a trailing newline
 * produces — otherwise every file diff would report a phantom change on the
 * last line. A run of two or more trailing newlines is a real blank line and
 * is kept.
 */
export function splitLines(text: string): string[] {
  if (text === '') return []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

type Direction = 0 | 1 | 2 // 0 = equal, 1 = removed from a, 2 = added from b

function lcsDirections(a: string[], b: string[]): Uint8Array {
  const height = a.length
  const width = b.length
  const dirs = new Uint8Array((height + 1) * (width + 1))
  let prev = new Int32Array(width + 1)
  let curr = new Int32Array(width + 1)

  for (let i = 1; i <= height; i++) {
    curr.fill(0)
    const aLine = a[i - 1]

    for (let j = 1; j <= width; j++) {
      const at = i * (width + 1) + j
      if (aLine === b[j - 1]) {
        curr[j] = prev[j - 1] + 1
        dirs[at] = 0
      } else if (prev[j] >= curr[j - 1]) {
        curr[j] = prev[j]
        dirs[at] = 1
      } else {
        curr[j] = curr[j - 1]
        dirs[at] = 2
      }
    }

    const swap = prev
    prev = curr
    curr = swap
  }

  return dirs
}

/** LCS walk over already-trimmed middles, without line numbers. */
function diffMiddle(a: string[], b: string[]): { type: DiffLineType; text: string }[] {
  if (a.length === 0) return b.map((text) => ({ type: 'add' as const, text }))
  if (b.length === 0) return a.map((text) => ({ type: 'remove' as const, text }))

  if (a.length * b.length > MAX_DP_CELLS) {
    return [
      ...a.map((text) => ({ type: 'remove' as const, text })),
      ...b.map((text) => ({ type: 'add' as const, text })),
    ]
  }

  const width = b.length
  const dirs = lcsDirections(a, b)
  const out: { type: DiffLineType; text: string }[] = []

  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    const direction: Direction = i === 0 ? 2 : j === 0 ? 1 : (dirs[i * (width + 1) + j] as Direction)

    if (direction === 0) {
      out.push({ type: 'context', text: a[i - 1] })
      i--
      j--
    } else if (direction === 1) {
      out.push({ type: 'remove', text: a[i - 1] })
      i--
    } else {
      out.push({ type: 'add', text: b[j - 1] })
      j--
    }
  }

  out.reverse()
  return out
}

/**
 * Within a change the traceback is free to interleave removals and additions —
 * both orders describe the same edit. A reader is not: every diff viewer shows
 * the old lines first, so each run of changes is reordered to removals then
 * additions. Numbering happens afterwards, so the two sides stay in step.
 */
function removalsFirst<T extends { type: DiffLineType }>(lines: T[]): T[] {
  const out: T[] = []
  let index = 0

  while (index < lines.length) {
    if (lines[index].type === 'context') {
      out.push(lines[index++])
      continue
    }

    const run: T[] = []
    while (index < lines.length && lines[index].type !== 'context') run.push(lines[index++])
    out.push(
      ...run.filter((line) => line.type === 'remove'),
      ...run.filter((line) => line.type === 'add')
    )
  }

  return out
}

/** Line-by-line diff of two texts, with line numbers filled in. */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = splitLines(oldText)
  const b = splitLines(newText)

  // Common prefix and suffix. They are context by definition, and trimming
  // them keeps the dynamic program over a small middle on realistic edits.
  const shortest = Math.min(a.length, b.length)
  let prefix = 0
  while (prefix < shortest && a[prefix] === b[prefix]) prefix++

  let suffix = 0
  while (
    suffix < shortest - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++
  }

  const middle = diffMiddle(
    a.slice(prefix, a.length - suffix),
    b.slice(prefix, b.length - suffix)
  )

  const raw = removalsFirst([
    ...a.slice(0, prefix).map((text) => ({ type: 'context' as const, text })),
    ...middle,
    ...a.slice(a.length - suffix).map((text) => ({ type: 'context' as const, text })),
  ])

  let oldLine = 1
  let newLine = 1

  return raw.map((line) => {
    if (line.type === 'context') {
      const numbered = { ...line, oldLine: oldLine++, newLine: newLine++ }
      return numbered
    }
    if (line.type === 'remove') return { ...line, oldLine: oldLine++ }
    return { ...line, newLine: newLine++ }
  })
}

export function diffStats(lines: DiffLine[]): DiffStats {
  let added = 0
  let removed = 0
  for (const line of lines) {
    if (line.type === 'add') added++
    else if (line.type === 'remove') removed++
  }
  return { added, removed }
}

export function hasChanges(lines: DiffLine[]): boolean {
  return lines.some((line) => line.type !== 'context')
}

/**
 * Group a diff into hunks, keeping `context` unchanged lines around each
 * change. Two changes merge when their padded ranges touch — that is, exactly
 * when splitting them would have hidden nothing, so a second header would buy
 * no fold at all.
 *
 * Returns an empty array when the two texts are identical.
 */
export function toHunks(lines: DiffLine[], context = 3): DiffHunk[] {
  const changed: number[] = []
  lines.forEach((line, index) => {
    if (line.type !== 'context') changed.push(index)
  })
  if (changed.length === 0) return []

  // Group changed indices into ranges, each padded by `context`.
  const ranges: { from: number; to: number }[] = []
  for (const index of changed) {
    const from = Math.max(0, index - context)
    const to = Math.min(lines.length - 1, index + context)
    const last = ranges[ranges.length - 1]

    if (last && from <= last.to + 1) last.to = Math.max(last.to, to)
    else ranges.push({ from, to })
  }

  const hunks: DiffHunk[] = []
  let cursor = 0

  for (const range of ranges) {
    const hidden = lines.slice(cursor, range.from)
    const body = lines.slice(range.from, range.to + 1)
    const stats = diffStats(body)
    const firstOld = body.find((line) => line.oldLine !== undefined)?.oldLine
    const firstNew = body.find((line) => line.newLine !== undefined)?.newLine

    hunks.push({
      ...stats,
      startIndex: range.from,
      endIndex: range.to,
      oldStart: firstOld ?? 0,
      newStart: firstNew ?? 0,
      oldCount: body.filter((line) => line.oldLine !== undefined).length,
      newCount: body.filter((line) => line.newLine !== undefined).length,
      lines: body,
      hidden,
    })

    cursor = range.to + 1
  }

  return hunks
}

/**
 * Pair a unified diff up for a side-by-side view: a run of removals is zipped
 * with the run of additions that follows it, padding the shorter side so both
 * columns stay in step.
 */
export function toSplitRows(lines: DiffLine[]): DiffSplitRow[] {
  const rows: DiffSplitRow[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.type === 'context') {
      rows.push({ left: line, right: line })
      index++
      continue
    }

    const removes: DiffLine[] = []
    const adds: DiffLine[] = []
    while (index < lines.length && lines[index].type !== 'context') {
      if (lines[index].type === 'remove') removes.push(lines[index])
      else adds.push(lines[index])
      index++
    }

    const height = Math.max(removes.length, adds.length)
    for (let row = 0; row < height; row++) {
      rows.push({ left: removes[row], right: adds[row] })
    }
  }

  return rows
}

export interface UnifiedTextOptions {
  /** Old-side label in the `---` header. Defaults to `a`. */
  oldName?: string
  /** New-side label in the `+++` header. Defaults to `b`. */
  newName?: string
}

/**
 * Render hunks as a patch file. This is what a "copy diff" button puts on the
 * clipboard, and what `git apply` expects to read — so it follows the format
 * exactly rather than approximating it.
 */
export function formatUnifiedDiff(hunks: DiffHunk[], options: UnifiedTextOptions = {}): string {
  if (hunks.length === 0) return ''

  const { oldName = 'a', newName = 'b' } = options
  const out = [`--- ${oldName}`, `+++ ${newName}`]

  for (const hunk of hunks) {
    out.push(`@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`)
    for (const line of hunk.lines) {
      const sign = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '
      out.push(`${sign}${line.text}`)
    }
  }

  return out.join('\n')
}
