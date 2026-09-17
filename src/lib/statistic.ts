/**
 * Turning a number into the string a dashboard should show.
 *
 * `Stat` handles a card with a trend line; this is the number itself, which is
 * where the fussy parts live — thousands separators, a fixed number of
 * decimals, a currency mark that belongs outside the minus sign, and the
 * empty figure a missing value should read as rather than `NaN`.
 */

export interface StatisticFormat {
  /** Decimals to keep. Defaults to 0. */
  precision?: number
  /** Defaults to `","`. */
  groupSeparator?: string
  /** Defaults to `"."`. */
  decimalSeparator?: string
  /** Rendered before the number, after any minus sign — `"¥"`, `"$"`. */
  prefix?: string
  /** Rendered after the number — `"%"`, `" ms"`, `" / mo"`. */
  suffix?: string
  /** What to show instead of a number that is not one. Defaults to `"—"`. */
  fallback?: string
}

/** `"1234567"` → `"1,234,567"`. */
export function groupDigits(digits: string, separator = ','): string {
  if (separator === '') return digits

  const chunks: string[] = []
  let end = digits.length

  while (end > 0) {
    const start = Math.max(0, end - 3)
    chunks.unshift(digits.slice(start, end))
    end = start
  }

  return chunks.join(separator)
}

/**
 * Format one number.
 *
 * The sign sits before any decimals and after any prefix, so a loss reads
 * `¥-1,204.50` rather than `-¥1,204.50` — the mark describes the currency, not
 * the direction. Values that are not finite read as the fallback, because a
 * figure nobody can act on should say so plainly.
 */
export function formatStatisticValue(
  value: number,
  {
    precision = 0,
    groupSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
    fallback = '—',
  }: StatisticFormat = {}
): string {
  if (!Number.isFinite(value)) return fallback

  const decimals = Math.max(0, Math.trunc(precision))
  // `toFixed` rather than multiplication and division: a figure like
  // 1234.565 * 100 lands on 123456.49999999999 and rounds down.
  const fixed = Math.abs(value).toFixed(decimals)
  const [whole, fraction] = fixed.split('.')
  const grouped = `${groupDigits(whole, groupSeparator)}${fraction ? `${decimalSeparator}${fraction}` : ''}`

  return `${prefix}${value < 0 ? '-' : ''}${grouped}${suffix}`
}

/**
 * Where a count-up has reached.
 *
 * Eased rather than linear because a number racing from 0 to 8,431 reads as a
 * flicker; slowing into place reads as a figure settling.
 */
export function interpolateStatistic(from: number, to: number, progress: number): number {
  const eased = 1 - (1 - Math.min(1, Math.max(0, progress))) ** 3
  return from + (to - from) * eased
}

/**
 * Whether the user has asked motion away.
 *
 * Count-up is decoration: someone who has set `prefers-reduced-motion` should
 * get the number, not the film.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
