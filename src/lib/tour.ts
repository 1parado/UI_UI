/**
 * Where a guided tour puts its window.
 *
 * All of it is arithmetic on rectangles: given what the step points at, where
 * can the explanation go without leaving the screen, and how much of the page
 * has to be covered to make everything else recede. Keeping that here means
 * the component deals in placements rather than pixels.
 */

export interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(max, Math.max(min, value))
}

/** The spotlight: the target's box plus breathing room. */
export function spotlightRect(target: Rect, padding = 8): Rect {
  return {
    top: target.top - padding,
    left: target.left - padding,
    width: target.width + padding * 2,
    height: target.height + padding * 2,
  }
}

/**
 * The four bands that darken everything except the spotlight.
 *
 * Four rectangles rather than one shape with a hole because a hole needs CSS
 * masking, and this way every band is also something clickable — which is what
 * makes "click anywhere to dismiss" work.
 */
export function maskRects(hole: Rect, viewport: Size): Rect[] {
  const holeRight = hole.left + hole.width
  const holeBottom = hole.top + hole.height

  return [
    { top: 0, left: 0, width: viewport.width, height: Math.max(0, hole.top) },
    {
      top: Math.min(viewport.height, holeBottom),
      left: 0,
      width: viewport.width,
      height: Math.max(0, viewport.height - holeBottom),
    },
    {
      top: hole.top,
      left: 0,
      width: Math.max(0, hole.left),
      height: hole.height,
    },
    {
      top: hole.top,
      left: holeRight,
      width: Math.max(0, viewport.width - holeRight),
      height: hole.height,
    },
  ]
}

export interface PlaceCardOptions {
  placement?: TourPlacement
  gap?: number
  margin?: number
}

/**
 * Where the card goes, or `null` when there is no target to point at.
 *
 * The requested side is honoured until the card would leave the screen, at
 * which point it flips to the opposite side — and only then gets pushed back
 * inside the viewport, so it never hangs off an edge.
 */
export function placeCard(
  hole: Rect,
  card: Size,
  viewport: Size,
  { placement = 'bottom', gap = 12, margin = 12 }: PlaceCardOptions = {}
): { top: number; left: number; placement: TourPlacement } {
  let resolved = placement

  if (placement === 'top' && hole.top - gap - card.height < margin) resolved = 'bottom'
  if (placement === 'bottom' && hole.top + hole.height + gap + card.height > viewport.height - margin)
    resolved = 'top'
  if (placement === 'left' && hole.left - gap - card.width < margin) resolved = 'right'
  if (placement === 'right' && hole.left + hole.width + gap + card.width > viewport.width - margin)
    resolved = 'left'

  let { top, left } = cardPosition(resolved, hole, card, gap)

  top = clamp(top, margin, Math.max(margin, viewport.height - card.height - margin))
  left = clamp(left, margin, Math.max(margin, viewport.width - card.width - margin))

  return { top, left, placement: resolved }
}

function cardPosition(
  placement: TourPlacement,
  hole: Rect,
  card: Size,
  gap: number
): { top: number; left: number } {
  switch (placement) {
    case 'top':
      return {
        top: hole.top - gap - card.height,
        left: hole.left + hole.width / 2 - card.width / 2,
      }
    case 'left':
      return {
        top: hole.top + hole.height / 2 - card.height / 2,
        left: hole.left - gap - card.width,
      }
    case 'right':
      return {
        top: hole.top + hole.height / 2 - card.height / 2,
        left: hole.left + hole.width + gap,
      }
    case 'bottom':
    default:
      return {
        top: hole.top + hole.height + gap,
        left: hole.left + hole.width / 2 - card.width / 2,
      }
  }
}

/** Screen centre — where a step with nothing to point at belongs. */
export function centreCard(card: Size, viewport: Size): { top: number; left: number } {
  return {
    top: viewport.height / 2 - card.height / 2,
    left: viewport.width / 2 - card.width / 2,
  }
}
