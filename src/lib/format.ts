/**
 * Number formatting shared by chat surfaces — token counts, cost, file size.
 * Kept in one place so `ComposerHint`, `UsageMeter` and `Attachment` agree.
 */

/** `1204` → `1,204`. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/** `1204` → `1.2K`, `1250000` → `1.3M`. Used for token and price hints. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

/** `1536` → `1.5 KB`. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )
  const value = bytes / 1024 ** exponent
  const digits = exponent === 0 ? 0 : value >= 10 ? 0 : 1

  return `${value.toFixed(digits)} ${BYTE_UNITS[exponent]}`
}
