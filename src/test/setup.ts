import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Testing Library only auto-registers cleanup when the test framework exposes
// globals. This project runs Vitest without `globals: true`, so unmount the
// rendered tree ourselves — otherwise the DOM accumulates across tests and
// queries like `getByRole('switch')` start matching several elements.
afterEach(() => {
  cleanup()
})

// jsdom ships no layout engine, so a few APIs that Radix and cmdk rely on are
// missing. Stub the ones that are called unconditionally.

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  globalThis.ResizeObserver = ResizeObserverStub
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

/**
 * Pointer capture is another layout-engine-adjacent API jsdom never shipped —
 * `setPointerCapture`, `releasePointerCapture` and `hasPointerCapture` are all
 * absent from jsdom 25. vaul calls `setPointerCapture` unconditionally on
 * pointerdown so a drawer keeps tracking the drag after the pointer leaves it;
 * without the method the TypeError escapes as an unhandled error on every
 * drawer interaction.
 *
 * Tracking the ids keeps `hasPointerCapture` answering truthfully instead of
 * hard-coding `false`, which matters for libraries that guard work behind it.
 */
const capturedPointers = new WeakMap<Element, Set<number>>()

function pointerIdsFor(element: Element): Set<number> {
  let ids = capturedPointers.get(element)
  if (!ids) {
    ids = new Set<number>()
    capturedPointers.set(element, ids)
  }
  return ids
}

if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function setPointerCapture(pointerId: number) {
    pointerIdsFor(this).add(pointerId)
  }
}

if (typeof Element !== 'undefined' && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function releasePointerCapture(pointerId: number) {
    pointerIdsFor(this).delete(pointerId)
  }
}

if (typeof Element !== 'undefined' && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function hasPointerCapture(pointerId: number) {
    return pointerIdsFor(this).has(pointerId)
  }
}

// jsdom does not implement `matchMedia`. vaul asks it whether the page is
// running as an installed PWA (`display-mode: standalone`) before switching its
// drawer into a fixed position, and calls it unconditionally on open — without
// the stub every non-modal drawer test dies on the first render.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
  }
}

// `elementFromPoint` needs a layout engine to answer, so jsdom leaves it out
// entirely. input-otp probes it from a timer to decide whether a password
// manager's badge would cover its input; the resulting TypeError escapes as an
// unhandled error and fails the run even though every assertion passed. A
// `null` answer is what the probe would see for an uncovered input anyway.
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null
}

/**
 * Vendor-prefixed transform reads have to answer with a string.
 *
 * vaul resolves a drawer's current offset like this:
 *
 * ```js
 * const style = window.getComputedStyle(element)
 * const transform = style.transform || style.webkitTransform || style.mozTransform
 * return transform.match(/^matrix\((.+)\)$/)
 * ```
 *
 * jsdom's cssstyle implements the standard `transform` (it reads back as `''`
 * when unset) but none of the vendor aliases, so those read back as
 * `undefined` — the `||` chain then hands `undefined` to `.match` and the
 * TypeError escapes as an unhandled error after the assertions have already
 * passed. Browsers treat the aliases as synonyms for `transform`, so
 * forwarding them is both the honest fix and what calling code expects.
 */
if (typeof CSSStyleDeclaration !== 'undefined') {
  const TRANSFORM_ALIASES = ['webkitTransform', 'mozTransform', 'msTransform', 'OTransform']

  for (const alias of TRANSFORM_ALIASES) {
    if (alias in CSSStyleDeclaration.prototype) continue

    Object.defineProperty(CSSStyleDeclaration.prototype, alias, {
      configurable: true,
      get(this: CSSStyleDeclaration) {
        return this.transform ?? ''
      },
      set(this: CSSStyleDeclaration, value: string) {
        this.transform = value
      },
    })
  }
}

/**
 * Top-layer pseudo-classes have to answer for themselves.
 *
 * floating-ui probes the top layer on every popper update:
 *
 * ```js
 * try { return element.matches(':modal') } catch { return false }
 * ```
 *
 * jsdom routes `matches` into nwsapi, and nwsapi implements `:modal` on top of
 * `isFullscreen()`, which falls back to the element's own `matches` — landing
 * straight back in jsdom, which re-enters nwsapi, and round again. The pair
 * spins for ~30 million calls before it unwinds: a single `userEvent.click`
 * against a mounted popper spends 19 seconds in there. Nothing throws, so the
 * only symptom is a suite that hangs.
 *
 * jsdom has no top layer, so `false` is the honest answer and it stops the loop
 * before it starts.
 */
const TOP_LAYER_SELECTORS = new Set([':modal', ':fullscreen', ':popover-open'])
const originalMatches = Element.prototype.matches

Element.prototype.matches = function matches(selectors: string): boolean {
  if (TOP_LAYER_SELECTORS.has(selectors)) return false
  return originalMatches.call(this, selectors)
}

/**
 * jsdom has no `IntersectionObserver`. embla-carousel (behind `Carousel`) uses
 * one to notice when a slide is visible, and constructs it during
 * initialisation — without the stub every carousel render throws
 * `IntersectionObserver is not defined` before a single assertion runs.
 *
 * The stub never fires a callback, which is the honest answer offline: nothing
 * is ever observed to be intersecting.
 */
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver
}
