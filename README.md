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

### Previewing the component explorer

Two ways to look at the components, for two different jobs:

| | Command | Use it when |
|---|---|---|
| Dev server | `pnpm storybook` | You are editing components. Only the stories you open get compiled, and edits hot-reload. |
| Static build | `pnpm build-storybook` then `pnpm storybook:preview` | You want the real production artifact, or something to hand to someone else. |

`pnpm storybook:preview` starts `scripts/serve-storybook.mjs` on
<http://127.0.0.1:6006>. It is a zero-dependency server that does three things
`python -m http.server` does not, and they are what makes the difference between
a preview that snaps open and one that appears to hang:

- **brotli/gzip.** The build is ~8.7 MB of JavaScript, which compresses to about
  1.3 MB — a 77% reduction on the wire.
- **Immutable caching.** Content-hashed bundles under `assets/`, `sb-addons/` and
  `sb-manager/` are sent with `Cache-Control: immutable`, so reloads and revisits
  come from the disk cache. Only `index.html`, `iframe.html` and `index.json`
  are revalidated.
- **304 handling.** Fresh HTML is answered with `Not Modified` instead of the
  full body.

Point it somewhere else with `--port` / `--dir`.

The static build uses a **relative** base, so the same `storybook-static/`
directory works when served from the domain root, from a sub-path like
`/UI_UI/`, or straight off disk. The dev server keeps an absolute base so HMR
resolves module URLs correctly.

### Deploying

`.github/workflows/ci.yml` publishes the explorer to GitHub Pages on every push
to `main`, after the typecheck/lint/test/build job passes. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**; after that
it is live at <https://1parado.github.io/UI_UI/>.

## Components

**Form**
- **Button** — variants, sizes, loading state
- **Input** — text input with invalid state
- **Textarea** — multi-line input with invalid state
- **InputGroup** — input with icon / prefix / action slots inside one focus ring
- **InputOTP** — one-time-code slots with paste and autofill support
- **Label** — accessible form labels
- **Checkbox** — with indeterminate support
- **RadioGroup / Radio** — single-choice groups
- **Select** — full-featured select with groups and separators
- **Slider** — single and range sliders
- **Switch** — accessible toggle
- **Toggle** — two-state button for formatting and view switches
- **ToggleGroup** — a row of related toggles, single or multiple
- **Combobox** — searchable single/multi select with the list inside a popover
- **Calendar** — date grid built on `react-day-picker` v9: single, range or multiple
- **DatePicker / DateRangePicker** — a calendar behind a popover trigger, with a clear affordance
- **NativeSelect** — the platform `<select>`, styled to match: a chevron overlay, sizes, invalid state
- **Form** — react-hook-form binding: `Form` / `FormField` / `FormItem` / `FormControl` / `FormLabel` / `FormMessage` wired to this library's controls
- **Questionnaire** — a survey built from a question schema: choice, multi-choice, rating, text and number questions, validation, and a progress bar that skips optional ones

**Layout & structure**
- **Card** — header / content / footer composition
- **Accordion** — stacked disclosure sections, single or multiple
- **Collapsible** — one independently toggled disclosure region
- **Breadcrumb** — path landmark with collapsing and `asChild` links
- **Pagination** — composable page bar plus a pure `getPaginationRange` helper
- **Separator** — horizontal / vertical, decorative or semantic
- **Tabs** — keyboard-navigable tab panels
- **ScrollArea** — custom-scrollbar viewport for long lists
- **Typography** — `Heading`, `Text`, `Small`, `Blockquote`, `InlineCode`
- **AspectRatio** — locks a box to a ratio so media cannot shift the layout
- **ButtonGroup** — attaches related buttons into one control (segmented choice, split action)
- **Table** — table primitives with an overflow-scroll container
- **DataTable** — sortable, paginated table driven by column definitions
- **Sidebar** — collapsible app rail: provider with persistence and ⌘B, groups, menus, mobile sheet
- **NavigationMenu** — site navigation whose panels share one animated viewport
- **Segmented** — one choice out of a few, all visible; a radio group to AT (one tab stop, arrow keys), unlike a row of toggles
- **Affix** — pins a child past a scroll threshold and holds its box, so the layout around it does not jump
- **Anchor** — table of contents as real `#` links, highlighting the section you are in
- **FloatButton / FloatButtonGroup / BackTop** — floating action button, a stack behind one corner, and a back-to-top that stays out of the tab order until it is useful
- **Item** — list row composition (media / content / actions) for feeds, results and settings pages
- **DirectionProvider** — LTR/RTL context: components read it, and `useDirectionControls` lets a settings page flip it
- **Resizable** — draggable panel splits with keyboard resizing and optional `localStorage` persistence
- **VirtualList** — windowed rendering over `@tanstack/react-virtual` for thousand-row lists
- **Carousel** — embla-backed slides with arrows, dot indicators and a same-height track

**Overlays**
- **Dialog** — modal with focus trap, ESC close, scroll lock
- **AlertDialog** — confirmation that blocks outside interaction, focus on Cancel
- **Sheet** — panel sliding in from any edge (settings, filters, details)
- **Drawer** — drag-to-dismiss bottom sheet for touch-first flows
- **Popover** — anchored floating panel
- **HoverCard** — hover preview for an entity or link target
- **Tooltip** — hover/focus hints
- **DropdownMenu** — action menus with labels and separators
- **ContextMenu** — right-click menus, same API as `DropdownMenu`
- **Menubar** — desktop-style File / Edit / View strip with submenus
- **Command** — filterable command list and ⌘K palette

**Feedback**
- **Alert** — static banners (default / destructive / success / warning)
- **Toast** — transient notifications with viewport management
- **Progress** — animated progress bar with ARIA attributes
- **Spinner** — indeterminate activity indicator
- **Skeleton** — loading placeholder
- **Empty** — empty-state composition
- **Badge** — status badges
- **Result** — the end of a flow: success, error, warning, 404, 403, 500, with a title, an explanation and actions
- **Watermark** — canvas-tiled mark over its children, `aria-hidden` and click-through, restored if deleted in devtools

**Status & data display**
- **Timeline** — ordered activity list; entries carry a status, a timestamp and any content
- **Descriptions** — definition list for detail panels, multi-column and label-left
- **Stepper** — multi-step flow with completed / current / error states, horizontal or vertical
- **Rating** — star rating driven as one slider, so half steps and keyboard control both work
- **TagInput** — free-text tags; Enter or comma commits, Backspace removes, IME-safe
- **Sparkline** — axis-free trend line for table cells and stat cards
- **RingProgress** — single-ratio progress ring, same ARIA contract as `Progress`
- **Stat** — one metric: label, figure, change and an optional sparkline
- **Chart** — recharts connected to `--chart-*` design tokens: `ChartContainer` for sizing and theming, `ChartTooltip` / `ChartLegend` for the dressing, and the recharts chart primitives re-exported
- **QRCode** — `qrcode.react` on a forced white plate with a rounded frame, so it stays scannable in dark mode
- **NotificationCenter / NotificationList** — bell with an unread count over an inbox list
  grouped into unread and read

**Pickers**
- **ColorPicker** — hue slider, saturation/brightness square, hex field and presets; the
  colour maths lives in `lib/color`, so no dependency is added
- **TimePicker / TimeColumns / DateTimePicker** — hour and minute columns, 24- or 12-hour
  display, optional native fallbacks
- **MultiSelect** — grouped options, select-all and an optional ceiling on selections
- **Cascader** — one answer per level of a tree, drawn as a column per level; the walk lives in `lib/cascader`
- **TreeSelect** — a tree in a dropdown: checked folders cascade to their branch, half-covered ones draw a dash, and search prunes to what it can still reach
- **Transfer** — two lists whose whole state is *which keys are on the right*, so `targetKeys` survives a round trip through a server
- **AutoComplete** — a field that suggests but accepts anything typed; options may be bare strings, grouped, or carry hidden keywords

**Other**
- **Avatar** — image with automatic fallback
- **Kbd / KbdGroup** — keyboard keys and shortcuts

### AI surfaces

Components for chat and agent products. They compose with the primitives above
rather than replacing them — a chat surface is `ConversationSidebar` +
`MessageList` + `Composer`.

**Conversation**
- **Message** — `user` / `assistant` / `system` layouts with avatar, content and action slots
- **MessageList** — scroll container with stick-to-bottom, pause-on-scroll-up and jump-to-latest
- **Composer** — prompt input: auto-growing textarea, Enter to send, IME-safe, send/stop
- **StreamingText** — plain-text stream with caret and interrupted state
- **TypingIndicator** — "thinking" dots
- **Bubble / BubbleGroup** — chat bubbles with in/out sides, an optional tail, delivery status ticks and a meta line
- **Marker** — the "new messages" divider inside a transcript, with the unread count as its label

**Generated output**
- **MarkdownRenderer** — markdown → library typography, fences become `CodeBlock`
- **CodeBlock** — language label, one-tap copy, horizontal scroll
- **Citation / SourceChip** — RAG footnote markers and source pills
- **ToolCallCard / AgentStep** — tool calls, parameters, results, agent step chains

**History & context**
- **ConversationSidebar** — grouped history with inline rename and delete
- **AttachmentList / Attachment** — upload chips with preview and remove
- **ModelSelector** — grouped model picker with capability hints

**Feedback & control**
- **StopButton** — cancel an in-flight generation
- **Feedback** — rate up/down and regenerate
- **UsageMeter** — token / cost budget readout with warn and over-limit states

**Code, files and process output**

The four components a coding agent needs to show its work. Each one carries the
parsing it depends on in `lib/`, so none of them adds a dependency: a diff
without a diff engine, ANSI colour without a terminal emulator, a file tree
without a path library.

- **Diff / CodeDiff** — line diff with foldable unchanged runs, a unified or
  split view, line numbers and a copy action that writes a real patch file.
  The alignment is `lib/diff`, which trims the common head and tail first and
  only runs the LCS over the changed middle. Lines are not syntax highlighted.
- **Tree / FileTree** — one tab stop, arrow keys, `aria-level` on a flattened
  list. Selecting a folder opens it. `FileTree` takes a list of paths and builds
  the nesting itself (`lib/file-tree`), with an icon per file kind.
- **Terminal / LogViewer** — 16/256/24-bit ANSI colour, a ring buffer, a
  timestamp column and output that follows itself until you scroll up.
  `LogViewer` adds a level chip read off each line (`lib/log`), a solo-style
  level filter and a search box. The surface is dark in both themes, which is
  why its colours come from `--terminal-*` / `--ansi-*`.
- **FileUpload** — drop zone plus queue: type, size and count limits enforced on
  dropped files as well as picked ones, per-file progress, retry, abort on
  remove or unmount, controlled or uncontrolled.

## Consuming the library

```bash
pnpm add @paradox/ui
```

`react-markdown`, `remark-gfm` and `rehype-highlight` come along as dependencies
of this package and are kept **external** in the bundle — they are only loaded if
you import `MarkdownRenderer`, so nothing else pays for them.

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
// The .hljs-* map in the components layer themes code fences — keep it too.
```

Motion is limited to three intents — a disclosure opening, a panel sliding in
from an edge, and an overlay fading — and every one of them is disabled under
`prefers-reduced-motion`. The keyframes ship inside `@paradox/ui/styles.css`, so
there is nothing extra to configure.

### Building a chat surface

```tsx
<ConversationSidebar>
  <ConversationSidebarHeader>{/* new chat */}</ConversationSidebarHeader>
  <ConversationSidebarContent>{/* groups + items */}</ConversationSidebarContent>
</ConversationSidebar>

<div className="flex min-h-0 flex-1 flex-col">
  <MessageList className="flex-1">
    <Message role="user">
      <MessageContent>{question}</MessageContent>
    </Message>
    <Message role="assistant">
      <MessageAvatar>{/* avatar */}</MessageAvatar>
      <MessageContent>
        <MarkdownRenderer>{answer}</MarkdownRenderer>
        <MessageActions>
          <Feedback onRegenerate={regenerate} />
        </MessageActions>
      </MessageContent>
    </Message>
  </MessageList>

  <Composer streaming={streaming} onStop={stop} onSubmit={send}>
    <ComposerTextarea placeholder="Ask about your codebase…" />
    <ComposerToolbar>
      <ComposerHint>{tokenHint}</ComposerHint>
      <ComposerSubmit className="ml-auto" />
    </ComposerToolbar>
  </Composer>
</div>
```

`MessageList` needs a bounded height — `flex-1 min-h-0` inside a column, or an
explicit height. Following pauses as soon as the reader scrolls up, so streamed
tokens never yank the viewport away from something being read.

Dark mode is toggled by adding the `dark` class to `<html>`.

## Design Tokens

All components use CSS variables for theming. See `src/styles/globals.css`.

Copy the whole `:root` / `.dark` block when consuming the library — the tokens
are one set, not a menu. Two groups are worth calling out:

- `--code-*` — mapped onto `.hljs-*` in `globals.css`, so a highlighted fence
  follows the theme without a third-party stylesheet.
- `--terminal-*` and `--ansi-*` — the terminal surface stays dark in both
  themes, so these are declared once in `:root` rather than twice. A light-mode
  terminal stops reading as a terminal, and one palette beats two.

## Docs

- Live Storybook: https://1parado.github.io/UI_UI/
- Agent guidelines: [AGENT.md](./AGENT.md)

## License

MIT
