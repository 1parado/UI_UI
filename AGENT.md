# AGENT.md — UI_UI Design & Engineering Guidelines

> This document is the single source of truth for humans and AI agents working on this component library.
> Follow it strictly. When in doubt: **consistency > novelty, clarity > cleverness, restraint > decoration**.

---

## 1. North Star

**Build a component library with taste.**

- **Taste** means deliberate choices, not trend-chasing.
- **Consistency** is non-negotiable — same patterns, same language, same rhythm everywhere.
- **Simplicity** is a feature. Remove until it breaks, then put one thing back.
- **Beauty** comes from proportion, spacing, hierarchy, and quiet confidence — not from effects.

If a change makes the system louder, more inconsistent, or harder to predict, reject it.

---

## 2. Design Principles

### 2.1 Consistency First

- One way to do one thing. Do not introduce a second API for the same intent.
- Shared tokens only. Never hard-code colors, radii, or spacing outside the token system.
- Naming must be predictable: `size`, `variant`, `disabled`, `loading` — same names across components.
- Visual rhythm must feel related: spacing scale, type scale, and radius scale stay coherent.

### 2.2 Restraint & Taste

- Prefer calm surfaces over busy ones.
- Prefer clear hierarchy over decorative hierarchy.
- Prefer one strong accent over many competing accents.
- Motion should be short, purposeful, and rare. No gratuitous animation.
- Shadows and borders are tools for structure, not decoration. Use the lightest effective option.

### 2.3 Clarity

- A component’s purpose should be obvious from its name and primary props.
- States (hover, focus, active, disabled, loading) must be distinct but not dramatic.
- Focus rings are mandatory and visible. Never remove focus styles for aesthetics.

### 2.4 Accessibility is Taste

- Keyboard support, focus management, and ARIA are part of the design — not an afterthought.
- Contrast must meet WCAG AA at minimum.
- Do not ship a “pretty” component that fails basic a11y.

---

## 3. Visual System

### 3.1 Design Tokens (source of truth)

All visual decisions flow through CSS variables defined in `src/styles/globals.css`.

| Category | Rule |
|----------|------|
| Color | Use semantic tokens only (`primary`, `muted`, `destructive`, etc.). No raw hex/hsl in components. |
| Spacing | Prefer Tailwind spacing scale. Keep vertical rhythm consistent (e.g. `1.5`, `2`, `3`, `4`, `6`). |
| Radius | Use `--radius` and derived values (`lg` / `md` / `sm`). Do not invent one-off radii. |
| Typography | Limit to a small type scale. Prefer `text-sm` for controls, clear hierarchy for titles. |
| Borders | Default to `border-border`. Avoid heavy or colored borders unless semantic. |

### 3.2 Light & Dark

- Every component must work in both themes.
- Dark mode is not “invert colors.” Preserve hierarchy and contrast deliberately.
- Test both themes before considering a component done.

### 3.3 Density

- Default density is comfortable, not cramped, not sparse.
- Controls: default height `h-10` (40px). Provide `sm` / `lg` when needed, keep ratios consistent.
- Padding inside surfaces (cards, dialogs) should feel even and generous enough to breathe.

---

## 4. Component API Rules

### 4.1 Naming

- Components: `PascalCase` (`Button`, `CardHeader`).
- Props: `camelCase`.
- Variants: short, semantic strings — `default` | `secondary` | `outline` | `ghost` | `destructive`.
- Sizes: `sm` | `default` | `lg` (and `icon` only when it is a true icon button).

### 4.2 Prop Design

- **Composition over configuration.** Prefer nested subcomponents (`Card` + `CardHeader`) over boolean prop explosion.
- Avoid props like `showHeader`, `hasFooter`, `isLarge`. Encode structure in JSX instead.
- Support native HTML attributes where it makes sense (`disabled`, `type`, `onClick`, etc.).
- Use `React.forwardRef` for all interactive or layout-root components.
- Set `displayName` on every forwardRef component.

### 4.3 Variants

- Implement variants with `class-variance-authority` (`cva`).
- Keep the variant matrix small. If a combination is rarely needed, do not expose it.
- Default variant must be the most common, calm choice — not the loudest.

### 4.4 Styling

- Use the `cn()` helper from `src/lib/utils.ts` for class merging.
- Tailwind utility classes only. No CSS modules, no styled-components, no inline style objects for theming.
- Allow `className` override on the root element so consumers can adjust layout without forking.

---

## 5. Code Structure

```text
src/
  components/
    ComponentName/
      ComponentName.tsx      # implementation
      index.ts               # public exports
      ComponentName.stories.tsx
  lib/
    utils.ts                 # cn() and shared helpers
  styles/
    globals.css              # tokens + base styles
  index.ts                   # library entry — export only public API
```

### Rules

- One component family per folder.
- Export only what consumers should use from `index.ts` files.
- Do not export internal helpers or experimental APIs from the package root.
- Stories live next to the component. Every public component needs stories.

---

## 6. Storybook Standards

- Title format: `Components/ComponentName`.
- Use `tags: ['autodocs']`.
- Cover at least: default, key variants, sizes, disabled, loading (if applicable).
- Prefer realistic labels (“Save changes”, “Email”) over “Button” / “Click me” when it improves judgment of taste.
- Layout: `centered` for single controls; use padded/fullscreen only when the component needs context.

---

## 7. What “Done” Means for a Component

A component is ready only when all of the following are true:

1. API is consistent with existing components.
2. Tokens are used exclusively for color, radius, and semantic surfaces.
3. Light and dark modes both look intentional.
4. Focus, hover, disabled (and loading if any) states are correct.
5. Keyboard and basic screen-reader behavior are acceptable.
6. Stories document the real usage surface.
7. Nothing was added “just in case.”

---

## 8. Decision Framework (for agents and humans)

When implementing or changing UI, ask in order:

1. **Does an existing pattern already solve this?** Reuse it.
2. **Does this introduce a new API concept?** Only if unavoidable; document why.
3. **Does this increase visual noise?** If yes, simplify.
4. **Would two components now look related if placed side by side?** If no, fix alignment of spacing, type, or variants.
5. **Is the simplest version still clear and accessible?** Ship that.

---

## 9. Explicit Anti-Patterns

Do **not**:

- Add gradients, glassmorphism, or heavy shadows by default.
- Invent one-off colors or radii inside a component file.
- Create multiple competing button styles that express the same intent.
- Hide focus outlines.
- Pack too many props into a single component to “make it flexible.”
- Animate by default without a clear purpose.
- Copy a trend that conflicts with the existing calm, consistent system.

---

## 10. Working with This Repo

- Stack: React + TypeScript + Tailwind + CVA + Storybook.
- Entry: `src/index.ts`.
- Tokens: `src/styles/globals.css`.
- Class merging: `cn()` from `src/lib/utils.ts`.
- Before adding a component, read an existing one (`Button`, `Input`, `Card`) and match its structure and tone.

**Default attitude:** quiet confidence, strict consistency, minimal surface area, high polish on what exists.

---

*When taste and speed conflict, choose taste. When taste and consistency conflict, choose consistency.*
