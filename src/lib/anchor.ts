/**
 * Which section a reader is in, from scroll position alone. Pulled out of
 * `Anchor` so the rule can be tested without a DOM: the answer depends only on
 * three numbers per section, and getting the boundary wrong is the usual bug in
 * a hand-rolled table of contents.
 */

export interface AnchorSection {
  id: string
  /** Distance from the top of the scrolling container, in pixels. */
  top: number
}

/**
 * The deepest section whose top has passed the reading line.
 *
 * `sections` must be sorted by `top` ascending — that is the order they appear
 * in the document, which is also the order they appear in the list.
 *
 * Above the first heading there is no current section, so the first one is
 * reported: a table of contents with nothing highlighted looks broken, and
 * "you are above the beginning of section one" is the same reading position as
 * "you are in section one".
 */
export function pickActiveAnchor(
  sections: AnchorSection[],
  scrollTop: number,
  offsetTop = 0
): string | undefined {
  if (sections.length === 0) return undefined

  const line = scrollTop + offsetTop
  let active = sections[0].id

  for (const section of sections) {
    if (section.top <= line) active = section.id
    else break
  }

  return active
}

/**
 * Where to scroll to put a section under a sticky header, clamped so the
 * container cannot be scrolled past its end (which would leave the last
 * section unhighlighted no matter how far you scroll).
 */
export function scrollTargetFor(
  sectionTop: number,
  offsetTop: number,
  maxScrollTop: number
): number {
  return Math.max(0, Math.min(sectionTop - offsetTop, maxScrollTop))
}
