/**
 * Shapes for the composite skeletons.
 *
 * Kept out of the component because the interesting part is the arithmetic,
 * and the arithmetic is the part worth pinning down with tests.
 */

/**
 * Widths, in percent, for a paragraph's worth of skeleton lines.
 *
 * Every line but the last runs the full width; the last is short, because a
 * block of identical full-width bars reads as a table rather than as text.
 */
export function paragraphWidths(lines: number, lastWidth = 60): number[] {
  if (!Number.isFinite(lines) || lines < 1) return []

  const whole = Math.floor(lines)
  return Array.from({ length: whole }, (_, index) =>
    index === whole - 1 ? lastWidth : 100
  )
}

/**
 * Column widths, in percent, for a table skeleton.
 *
 * The first column gets a fixed share because that is where the thing you
 * came to read usually lives — a name, a title — and the rest share what is
 * left. A single column takes everything.
 */
export function columnWidths(columns: number, firstShare = 40): number[] {
  if (!Number.isFinite(columns) || columns < 1) return []
  if (columns === 1) return [100]

  const rest = (100 - firstShare) / (columns - 1)
  return [firstShare, ...Array.from({ length: columns - 1 }, () => rest)]
}

/** Pixel sizes for `SkeletonAvatar`, so stories and tests agree on one scale. */
export const avatarSizes = { sm: 24, md: 32, lg: 40 } as const

export type AvatarSize = keyof typeof avatarSizes
