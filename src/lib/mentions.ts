/**
 * Where a mention starts, and how a pick rewrites the text.
 *
 * Mentions look like a dropdown but behave like text: nothing about them is
 * stateful, everything is derived from the caret position. That makes the two
 * jobs here worth having separate from the component — deciding whether the
 * caret is currently *inside* a mention, and splicing a replacement in
 * without disturbing the rest of the line.
 */

export interface MentionOption {
  key: string
  label: string
  description?: string
  disabled?: boolean
  [key: string]: unknown
}

export interface MentionMatch {
  /** Index of the trigger character in the full text. */
  start: number
  /** What was typed after the trigger, up to the caret. */
  query: string
}

/**
 * The mention the caret is inside, if any.
 *
 * The rules the interpretation rides on: a trigger only fires at the start of
 * the text or after whitespace (`hi@ada` is not a mention), no spaces are
 * allowed inside the handle, and a second trigger before the caret means the
 * earlier `@` was literal.
 */
export function activeMention(
  text: string,
  caret: number,
  trigger = '@',
  { allowSpace = false }: { allowSpace?: boolean } = {}
): MentionMatch | null {
  if (trigger === '') return null

  const before = text.slice(0, Math.max(0, Math.min(caret, text.length)))
  const start = before.lastIndexOf(trigger)
  if (start === -1) return null

  if (start > 0 && !/\s/.test(before[start - 1])) return null

  const query = before.slice(start + trigger.length)
  if (query.includes(trigger)) return null
  if (!allowSpace && /\s/.test(query)) return null

  return { start, query }
}

/**
 * Swap the matched text for a completed mention.
 *
 * One trailing space is added after the handle — but only when the text does
 * not already start with one, because accepting `@jo` in "cc @jo about it"
 * should read "cc @joana about it", not "cc @joana  about it".
 */
export function applyMention(
  text: string,
  match: MentionMatch,
  trigger: string,
  replacement: string
): { text: string; caret: number } {
  const before = text.slice(0, match.start)
  const after = text.slice(match.start + trigger.length + match.query.length)
  const gap = after === '' || !/^\s/.test(after) ? ' ' : ''
  const inserted = `${trigger}${replacement}${gap}`

  return {
    text: `${before}${inserted}${after}`,
    caret: before.length + inserted.length,
  }
}

/** Options worth offering for what has been typed so far. */
export function matchMentions(
  options: (string | MentionOption)[],
  query: string,
  limit?: number
): MentionOption[] {
  const needle = query.toLowerCase()
  const all = options.map((option) =>
    typeof option === 'string' ? { key: option, label: option } : option
  )

  const hits =
    needle === ''
      ? all
      : all.filter(
          (option) =>
            option.label.toLowerCase().includes(needle) ||
            option.key.toLowerCase().includes(needle)
        )

  return limit === undefined ? hits : hits.slice(0, limit)
}

/** Index of the next row ArrowDown should land on, skipping disabled ones. */
export function nextActiveIndex(options: MentionOption[], current: number, delta: number): number {
  if (options.length === 0 || options.every((option) => option.disabled === true)) return -1

  let index = current
  for (let step = 0; step < options.length; step += 1) {
    index = (index + delta + options.length) % options.length
    if (options[index].disabled !== true) return index
  }

  return -1
}
