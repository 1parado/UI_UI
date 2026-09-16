# @paradox/ui

A modern, accessible React UI component library built with TypeScript, Tailwind CSS, and Storybook.

## Features

- React 19 + TypeScript
- Tailwind CSS with design tokens
- Storybook documentation
- Accessibility-first components (Radix UI primitives for complex interactions)
- Dark mode support
- Tree-shakeable ESM + CJS builds
- Unit tested (Vitest + Testing Library) with CI quality gates

## Getting Started

```bash
# Install dependencies
pnpm install
# or
npm install

# Start Storybook
pnpm storybook

# Build the library
pnpm build

# Run quality checks
pnpm typecheck
pnpm lint
pnpm test
```

## Components

**Form**
- **Button** — variants, sizes, loading state
- **Input** — text input with invalid state
- **Textarea** — multi-line input with invalid state
- **Label** — accessible form labels
- **Checkbox** — with indeterminate support
- **RadioGroup / Radio** — single-choice groups
- **Select** — full-featured select with groups and separators
- **Slider** — single and range sliders
- **Switch** — accessible toggle

**Layout & structure**
- **Card** — header / content / footer composition
- **Separator** — horizontal / vertical, decorative or semantic
- **Tabs** — keyboard-navigable tab panels

**Overlays**
- **Dialog** — modal with focus trap, ESC close, scroll lock
- **Popover** — anchored floating panel
- **Tooltip** — hover/focus hints
- **DropdownMenu** — action menus with labels and separators

**Feedback**
- **Alert** — static banners (default / destructive / success / warning)
- **Toast** — transient notifications with viewport management
- **Progress** — animated progress bar with ARIA attributes
- **Skeleton** — loading placeholder
- **Empty** — empty-state composition
- **Badge** — status badges

**Other**
- **Avatar** — image with automatic fallback

## Consuming the library

```bash
pnpm add @paradox/ui
```

```tsx
// 1. Import the component and its styles
import { Button } from '@paradox/ui'
import '@paradox/ui/styles.css'

// 2. Make sure Tailwind scans your app and the library
// tailwind.config.js
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@paradox/ui/dist/**/*.js',
  ],
  // ...
}

// 3. Provide the design tokens (CSS variables) on <html>
// Copy the :root / .dark blocks from src/styles/globals.css
// into your global stylesheet, or set your own values.
```

Dark mode is toggled by adding the `dark` class to `<html>`.

## Design Tokens

All components use CSS variables for theming. See `src/styles/globals.css`.

## Docs

- Live Storybook: https://1parado.github.io/UI_UI/
- Agent guidelines: [AGENT.md](./AGENT.md)

## License

MIT
