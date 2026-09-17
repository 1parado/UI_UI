/**
 * Suggestion matching for `AutoComplete`.
 *
 * `Combobox` already covers picking out of a list; this is the other case —
 * a text field that keeps accepting whatever you type and only offers ideas
 * along the way. That difference shows up here twice: the option list is
 * derived *from the text*, and options can arrive as bare strings.
 */

export interface AutoCompleteOption {
  value: string
  /** Text to draw and search. Falls back to `value`. */
  label?: string
  disabled?: boolean
  /** Extra words that should find this option. */
  keywords?: string[]
  /** Collect several options under a heading. */
  group?: string
  [key: string]: unknown
}

/** How the current text narrows the list. `fn` hands it to `filterOption`. */
export type AutoCompleteFilter = 'startsWith' | 'includes' | 'fn'

/** Accept both bare strings and full option objects. */
export function normalizeOptions(
  options: (string | AutoCompleteOption)[]
): AutoCompleteOption[] {
  return options.map((option) => (typeof option === 'string' ? { value: option } : option))
}

export function optionText(option: AutoCompleteOption): string {
  return option.label ?? option.value
}

function defaultMatches(query: string, option: AutoCompleteOption, mode: AutoCompleteFilter) {
  const label = optionText(option).toLowerCase()
  const extras = (option.keywords ?? []).join(' ').toLowerCase()
  const haystack = `${label} ${extras}`

  return mode === 'startsWith' ? haystack.startsWith(query) : haystack.includes(query)
}

/**
 * Options worth showing for `query`.
 *
 * An empty query shows everything, which is what `openOnFocus` leans on: a
 * focused empty field is a request for ideas, not for an empty box.
 */
export function matchOptions(
  options: (string | AutoCompleteOption)[],
  query: string,
  {
    mode = 'includes',
    filterOption,
    limit,
  }: {
    mode?: AutoCompleteFilter
    filterOption?: (query: string, option: AutoCompleteOption) => boolean
    limit?: number
  } = {}
): AutoCompleteOption[] {
  const needle = query.trim().toLowerCase()
  const all = normalizeOptions(options)

  if (needle === '') return limit === undefined ? all : all.slice(0, limit)

  const hits = all.filter((option) =>
    mode === 'fn' && filterOption
      ? filterOption(needle, option)
      : defaultMatches(needle, option, mode)
  )

  return limit === undefined ? hits : hits.slice(0, limit)
}

export interface AutoCompleteGroupResult {
  group?: string
  options: AutoCompleteOption[]
}

/**
 * Options grouped by their `group` field.
 *
 * Blocks come out in the order the options arrived in, which means an
 * ungrouped option sitting between two groups starts a block of its own —
 * reordering behind the caller's back would be a worse surprise.
 */
export function groupOptions(options: AutoCompleteOption[]): AutoCompleteGroupResult[] {
  const groups: AutoCompleteGroupResult[] = []
  let bare: AutoCompleteOption[] = []

  const flushBare = () => {
    if (bare.length > 0) {
      groups.push({ options: bare })
      bare = []
    }
  }

  for (const option of options) {
    if (!option.group) {
      bare.push(option)
      continue
    }

    flushBare()
    const existing = groups.find((entry) => entry.group === option.group)
    if (existing) existing.options.push(option)
    else groups.push({ group: option.group, options: [option] })
  }

  flushBare()
  return groups
}

/** The row Enter acts on, if any. Disabled rows are not Enter-able. */
export function selectableIndex(
  options: AutoCompleteOption[],
  index: number
): number | undefined {
  const option = options[index]
  return option && option.disabled !== true ? index : undefined
}

/** Next row to highlight, wrapping inside the list. Disabled rows are skipped. */
export function nextIndex(
  options: AutoCompleteOption[],
  current: number,
  delta: number
): number {
  if (options.length === 0) return -1
  if (options.every((option) => option.disabled === true)) return -1

  let index = current
  for (let step = 0; step < options.length; step += 1) {
    index = (index + delta + options.length) % options.length
    if (options[index].disabled !== true) return index
  }

  return -1
}
