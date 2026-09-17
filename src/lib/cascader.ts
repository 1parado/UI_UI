/**
 * Walking a cascader option tree — the part worth testing on its own.
 *
 * A cascader's whole difficulty is that a *selection* is a list of ids and the
 * UI is a list of columns derived from it. Keeping that translation here means
 * the component only has to render whatever this module hands back.
 */

export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  /** Any extra payload the caller wants back from `onChange`. */
  [key: string]: unknown
}

/** A leaf plus the chain of ids that reaches it. */
export interface CascaderLeafPath {
  values: string[]
  labels: string[]
  /** True when the leaf or any of its ancestors is disabled. */
  disabled: boolean
}

export function isLeaf(option: CascaderOption): boolean {
  return !option.children || option.children.length === 0
}

/**
 * The chain of options named by `values`, stopping where the ids stop
 * matching. Partial chains are returned as-is rather than discarded: a value
 * carried over from an older option tree still deserves a label.
 */
export function findOptionPath(
  options: CascaderOption[],
  values: string[]
): CascaderOption[] {
  const path: CascaderOption[] = []
  let level = options

  for (const value of values) {
    const next = level.find((option) => option.value === value)
    if (!next) return path
    path.push(next)
    level = next.children ?? []
  }

  return path
}

/** Display string for a selection, e.g. `"Zhejiang / Hangzhou / Xihu"`. */
export function optionLabels(
  options: CascaderOption[],
  values: string[],
  separator = ' / '
): string {
  return findOptionPath(options, values)
    .map((option) => option.label)
    .join(separator)
}

/** Whether `values` names a leaf, which is what "done picking" means. */
export function isCompletePath(options: CascaderOption[], values: string[]): boolean {
  if (values.length === 0) return false

  const path = findOptionPath(options, values)
  if (path.length !== values.length) return false

  return isLeaf(path[path.length - 1])
}

/**
 * The columns the panel draws: column `0` is the root, column `i` is the
 * children of whatever is selected above it. Walking stops at a leaf, so the
 * panel never shows an empty column after a dead end.
 */
export function columnsFor(
  options: CascaderOption[],
  values: string[]
): CascaderOption[][] {
  const columns: CascaderOption[][] = [options]
  let level = options

  for (const value of values) {
    const next = level.find((option) => option.value === value)
    if (!next) break

    const children = next.children ?? []
    if (children.length === 0) break

    columns.push(children)
    level = children
  }

  return columns
}

/** Every leaf in the tree, with the ids that reach it. */
export function leafPaths(
  options: CascaderOption[],
  disabled = false
): CascaderLeafPath[] {
  const out: CascaderLeafPath[] = []

  const walk = (level: CascaderOption[], values: string[], labels: string[], parentDisabled: boolean) => {
    for (const option of level) {
      const nextDisabled = parentDisabled || option.disabled === true
      const nextValues = [...values, option.value]
      const nextLabels = [...labels, option.label]

      if (isLeaf(option)) {
        out.push({ values: nextValues, labels: nextLabels, disabled: nextDisabled })
      } else {
        walk(option.children ?? [], nextValues, nextLabels, nextDisabled)
      }
    }
  }

  walk(options, [], [], disabled)
  return out
}

/**
 * Leaves whose label chain mentions `query`. Matching against the whole chain
 * rather than the leaf alone is the point: typing "zhe" has to find Chinese
 * provinces buried three levels deep.
 */
export function searchLeafPaths(
  options: CascaderOption[],
  query: string,
  limit = 50
): CascaderLeafPath[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return []

  return leafPaths(options)
    .filter((path) =>
      path.labels.some((label) => label.toLowerCase().includes(needle))
    )
    .slice(0, limit)
}

/**
 * The ids that should be explored next after picking `option` at `level`.
 * Keeps everything above `level`, replaces this id, and drops whatever was
 * below — the deeper columns belonged to a different parent.
 */
export function explore(
  values: string[],
  level: number,
  value: string
): string[] {
  return [...values.slice(0, level), value]
}

/** Sibling that follows `value` in its own level, wrapping at both ends. */
export function siblingValue(
  level: CascaderOption[],
  value: string,
  delta: number
): string | undefined {
  if (level.length === 0) return undefined

  const index = level.findIndex((option) => option.value === value)
  if (index === -1) return level[0].value

  const next = (index + delta + level.length) % level.length
  return level[next].value
}
