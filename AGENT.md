# AGENT.md

Rules for humans and AI working on this library. Follow strictly.

**Priority:** consistency > taste > novelty. clarity > cleverness. restraint > decoration.

## Principles

- One pattern per intent. Do not add a second API for the same job.
- Tokens only — no hard-coded colors, radii, or ad-hoc spacing. Source: `src/styles/globals.css`.
- Calm UI: quiet surfaces, clear hierarchy, minimal motion, lightest effective border/shadow.
- Focus rings required. WCAG AA contrast. Keyboard and basic a11y are part of “done.”
- Composition over boolean props (`Card` + `CardHeader`, not `showHeader`).

## API

- Props: `size` (`sm` | `default` | `lg`), `variant` (`default` | `secondary` | `outline` | `ghost` | `destructive`), `disabled`, `loading`.
- `forwardRef` + `displayName` on interactive roots.
- Variants via `cva`. Classes via `cn()` from `src/lib/utils.ts`.
- Tailwind only. Allow root `className`.
- Default variant = calm and common, not loud.

## Structure

```text
src/components/Name/Name.tsx | index.ts | Name.stories.tsx
src/index.ts          # public exports only
```

Match existing `Button` / `Input` / `Card` structure before adding anything new.

## Stories

- Title: `Components/Name`, `tags: ['autodocs']`.
- Cover: default, variants, sizes, disabled, loading if any.
- Prefer realistic labels over “Click me.”

## Done checklist

Consistent API · tokens only · light + dark intentional · states correct · a11y OK · stories complete · nothing “just in case.”

## Do not

Gradients/glass/heavy shadows by default · hide focus · prop explosion · one-off colors/radii · trend styles that break the system · pointless animation.
