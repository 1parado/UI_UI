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

// `elementFromPoint` needs a layout engine to answer, so jsdom leaves it out
// entirely. input-otp probes it from a timer to decide whether a password
// manager's badge would cover its input; the resulting TypeError escapes as an
// unhandled error and fails the run even though every assertion passed. A
// `null` answer is what the probe would see for an uncovered input anyway.
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = () => null
}
