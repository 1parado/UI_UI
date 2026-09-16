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
