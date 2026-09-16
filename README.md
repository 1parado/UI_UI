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

**Overlays**
- **Dialog** — modal with focus trap, ESC close, scroll lock
- **AlertDialog** — confirmation that blocks outside interaction, focus on Cancel
- **Sheet** — panel sliding in from any edge (settings, filters, details)
- **Popover** — anchored floating panel
- **HoverCard** — hover preview for an entity or link target
- **Tooltip** — hover/focus hints
- **DropdownMenu** — action menus with labels and separators
- **ContextMenu** — right-click menus, same API as `DropdownMenu`
- **Command** — filterable command list and ⌘K palette

**Feedback**
- **Alert** — static banners (default / destructive / success / warning)
- **Toast** — transient notifications with viewport management
- **Progress** — animated progress bar with ARIA attributes
- **Spinner** — indeterminate activity indicator
- **Skeleton** — loading placeholder
- **Empty** — empty-state composition
- **Badge** — status badges

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

## Docs

- Live Storybook: https://1parado.github.io/UI_UI/
- Agent guidelines: [AGENT.md](./AGENT.md)

## License

MIT
