/**
 * Shuttle arithmetic — the rules behind a transfer list.
 *
 * A transfer keeps only *which keys are on the right*; the rest is derived.
 * That makes the component easy to reason about but leaves several small
 * questions (can this row move, what does the header checkbox show, which
 * side does a filtered item belong to) that are much easier to answer here
 * than in the middle of a render.
 */

export interface TransferItem {
  key: string
  title: string
  description?: string
  disabled?: boolean
  [key: string]: unknown
}

/** Which way a batch is moving: towards the target list, or back to the source. */
export type TransferDirection = 'to-target' | 'to-source'

/** True when every part is truthy — saves repeating someKeys && dst.length. */
export function canMove(selectedKeys: string[]): boolean {
  return selectedKeys.length > 0
}

/**
 * Moving selection boxes between two lists.
 *
 * `selectedKeys` are the rows ticked inside one panel and `keys` the batch
 * being moved. Keeping them apart is what lets a batch move while leaving the
 * rest of the panel's tick marks alone.
 */
export function targetKeysAfterMove(
  currentTargetKeys: string[],
  keys: string[],
  direction: TransferDirection
): string[] {
  if (direction === 'to-target') {
    const merged = [...currentTargetKeys]
    for (const key of keys) if (!merged.includes(key)) merged.push(key)
    return merged
  }

  const leaving = new Set(keys)
  return currentTargetKeys.filter((key) => !leaving.has(key))
}

/** Rows left of the divider, then rows right of it, in their original order. */
export function partitionItems<T extends { key: string }>(
  items: T[],
  targetKeys: string[]
): [source: T[], target: T[]] {
  const target = new Set(targetKeys)
  const source: T[] = []
  const targetItems: T[] = []

  for (const item of items) {
    if (target.has(item.key)) targetItems.push(item)
    else source.push(item)
  }

  return [source, targetItems]
}

/** Row style filter — every keyword has to appear, like a search box expects. */
export function filterItems<T extends TransferItem>(
  items: T[],
  query: string,
  filterOption?: (query: string, item: T) => boolean
): T[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return items

  if (filterOption) {
    return items.filter((item) => filterOption(needle, item))
  }

  return items.filter((item) => {
    const haystack = `${item.title} ${item.description ?? ''}`.toLowerCase()
    return needle.split(/\s+/).every((word) => haystack.includes(word))
  })
}

/** Keys a panel's "select all" box controls: everything visible and movable. */
export function selectableKeys<T extends { key: string; disabled?: boolean }>(
  items: T[]
): string[] {
  return items.filter((item) => item.disabled !== true).map((item) => item.key)
}

/**
 * Header checkbox state for one panel: every visible row ticked, some ticked,
 * or none. `false` also covers "nothing to tick" — an all-disabled panel has
 * no indeterminate state to show.
 */
export function selectAllState(
  visibleItems: { key: string; disabled?: boolean }[],
  selectedKeys: string[]
): 'none' | 'some' | 'all' {
  const available = selectableKeys(visibleItems)
  if (available.length === 0) return 'none'

  const ticked = available.filter((key) => selectedKeys.includes(key))
  if (ticked.length === 0) return 'none'
  if (ticked.length === available.length) return 'all'
  return 'some'
}

/** Toggling a panel-wide checkbox, leaving the other panel's ticks alone. */
export function toggleSelectAll(
  visibleItems: { key: string; disabled?: boolean }[],
  selectedKeys: string[]
): string[] {
  const available = new Set(selectableKeys(visibleItems))
  const allTicked = selectAllState(visibleItems, selectedKeys) === 'all'

  if (allTicked) return selectedKeys.filter((key) => !available.has(key))
  return Array.from(new Set([...selectedKeys, ...available]))
}

/** The `{selected} / {total}` line under each panel. */
export function panelSummary(
  items: { key: string }[],
  selectedKeys: string[]
): { selected: number; total: number } {
  const selected = items.filter((item) => selectedKeys.includes(item.key)).length
  return { selected, total: items.length }
}
