# @paradox/ui

A modern, accessible React UI component library built with TypeScript, Tailwind CSS, and Storybook.

## Features

- React 19 + TypeScript
- Tailwind CSS with design tokens
- Storybook documentation
- Accessibility-first components
- Dark mode support
- Tree-shakeable ESM + CJS builds

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
```

## Components

- **Button** — variants, sizes, loading state
- **Input** — text input with consistent styling and invalid state
- **Textarea** — multi-line input with invalid state and resize control
- **Label** — accessible form labels with disabled peer styling
- **Switch** — accessible toggle with checked/unchecked states
- **Card** — header / content / footer composition
- **Badge** — status badges in multiple variants
- **Alert** — banners (default / destructive / success / warning) with title & description
- **Avatar** — image with automatic fallback
- **Skeleton** — loading placeholder
- **Progress** — animated progress bar with ARIA attributes

## Design Tokens

All components use CSS variables for theming. See `src/styles/globals.css`.

## Docs

- Live Storybook: https://1parado.github.io/UI_UI/
- Agent guidelines: [AGENT.md](./AGENT.md)

## License

MIT
