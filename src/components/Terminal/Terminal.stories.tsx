import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Terminal } from './Terminal'

const meta: Meta<typeof Terminal> = {
  title: 'Components/Terminal',
  component: Terminal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Terminal>

export const Default: Story = {
  args: {
    className: 'w-[560px]',
    title: 'pnpm build',
    lines: [
      '> @paradox/ui@0.1.0 build',
      '> tsc -p tsconfig.build.json && vite build',
      '',
      'vite v6.0.11 building for production...',
      '✓ 431 modules transformed.',
      'dist/index.js  778.42 kB │ gzip: 152.18 kB',
      'built in 4.21s',
    ],
  },
}

/** Any SGR sequence the output carries is read and coloured. */
export const AnsiColours: Story = {
  args: {
    className: 'w-[560px]',
    title: 'test run',
    lines: [
      '\u001b[1m RUN \u001b[0m v3.2.7 \u001b[2mE:/UI-UI/UI_UI\u001b[0m',
      '',
      '\u001b[32m ✓\u001b[0m src/lib/diff.test.ts \u001b[2m(25 tests) 20ms\u001b[0m',
      '\u001b[32m ✓\u001b[0m src/lib/ansi.test.ts \u001b[2m(25 tests) 16ms\u001b[0m',
      '\u001b[33m ↓\u001b[0m src/lib/upload.test.ts \u001b[2m(skipped)\u001b[0m',
      '\u001b[31m ✗\u001b[0m src/components/Diff/Diff.test.tsx',
      '  \u001b[31mAssertionError\u001b[0m: expected \u001b[32m2\u001b[0m to be \u001b[32m3\u001b[0m',
      '',
      '\u001b[7m Test Files \u001b[0m \u001b[31m1 failed\u001b[0m | \u001b[32m3 passed\u001b[0m',
    ],
  },
}

/** 256-colour and 24-bit sequences are supported too. */
export const ExtendedColours: Story = {
  args: {
    className: 'w-[560px]',
    title: 'palette',
    lines: [
      '\u001b[38;5;196mred 196\u001b[0m  \u001b[38;5;208morange 208\u001b[0m  \u001b[38;5;46mgreen 46\u001b[0m',
      '\u001b[38;5;240mgrey 240\u001b[0m  \u001b[38;5;255mwhite 255\u001b[0m',
      '\u001b[38;2;120;80;255mtruecolor 120,80,255\u001b[0m',
      '\u001b[48;5;236m \u001b[38;5;252m dark chip \u001b[0m',
    ],
  },
}

const DEV_OUTPUT = [
  '\u001b[2m$ pnpm dev\u001b[0m',
  '\u001b[36mVITE\u001b[0m v6.0.11  ready in 412 ms',
  '',
  '  \u001b[32m➜\u001b[0m  Local:   \u001b[36mhttp://localhost:5173/\u001b[0m',
  '  \u001b[32m➜\u001b[0m  Network: \u001b[2muse --host to expose\u001b[0m',
  '',
  '\u001b[2m09:20:41\u001b[0m hmr update \u001b[36m/src/components/Diff/Diff.tsx\u001b[0m',
  '\u001b[2m09:20:44\u001b[0m hmr update \u001b[36m/src/components/Tree/Tree.tsx\u001b[0m',
  '\u001b[32m✓\u001b[0m rebuilt in 118 ms',
]

/**
 * A line a beat. Each tick schedules the next, so the demo keeps its own pace
 * instead of an interval that has to police itself.
 */
const StreamingDemo = () => {
  const [shown, setShown] = React.useState(1)

  React.useEffect(() => {
    if (shown >= DEV_OUTPUT.length) return
    const timer = window.setTimeout(() => setShown((count) => count + 1), 600)
    return () => window.clearTimeout(timer)
  }, [shown])

  return (
    <Terminal
      className="w-[560px]"
      title="dev server"
      lines={DEV_OUTPUT.slice(0, shown)}
      pending={shown < DEV_OUTPUT.length}
      maxLines={40}
    />
  )
}

/** Output arrives, the view follows it, and the ring buffer trims what falls off. */
export const Streaming: Story = {
  render: () => <StreamingDemo />,
}

/** Scrolling up pauses the follow and offers a way back down. */
export const RingBuffer: Story = {
  args: {
    className: 'w-[560px]',
    title: 'worker',
    maxLines: 8,
    lines: Array.from({ length: 24 }, (_, index) => `processed job ${index + 1} in ${30 + index}ms`),
  },
}

export const Timestamps: Story = {
  args: {
    className: 'w-[560px]',
    title: 'audit',
    timestamps: true,
    lines: [
      { text: 'session started', timestamp: '2026-09-17T09:20:00Z' },
      { text: 'loaded 12 documents', timestamp: '2026-09-17T09:20:04Z' },
      { text: 'answer streamed in 1.8s', timestamp: '2026-09-17T09:20:06Z' },
    ],
  },
}

/** A log is read, not scrolled sideways — but tabular output wants the opposite. */
export const NoWrapping: Story = {
  args: {
    className: 'w-[420px]',
    title: 'wide output',
    wrap: false,
    lines: [
      'NAME        READY   STATUS    RESTARTS   AGE     IP           NODE',
      'api-7fb9    1/1     Running   0          4h12m   10.1.4.22    node-a',
      'worker-2    1/1     Running   0          4h12m   10.1.4.31    node-b',
    ],
  },
}

export const Headerless: Story = {
  args: { className: 'w-[560px]', showHeader: false, lines: ['$ echo hello', 'hello'] },
}

export const Empty: Story = {
  args: { className: 'w-[560px]', title: 'sandbox', lines: [] },
}
