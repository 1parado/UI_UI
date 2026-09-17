import type { Meta, StoryObj } from '@storybook/react'
import { LogViewer } from './LogViewer'

const meta: Meta<typeof LogViewer> = {
  title: 'Components/LogViewer',
  component: LogViewer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LogViewer>

const workerLog = [
  '2026-09-17T09:20:21Z INFO  worker started with concurrency 4',
  '2026-09-17T09:20:21Z DEBUG loaded config from .env.local',
  '2026-09-17T09:20:22Z INFO  claimed job 8412 (index 42 documents)',
  '2026-09-17T09:20:24Z WARN  job 8412 slow: 812ms in embed',
  '2026-09-17T09:20:26Z ERROR job 8412 failed after 3 attempts: rate limited',
  '2026-09-17T09:20:26Z INFO  backing off for 4000ms',
  '2026-09-17T09:20:31Z DEBUG claimed job 8413',
  '2026-09-17T09:20:33Z FATAL shutting down: disk quota exceeded',
]

export const Default: Story = {
  render: () => <LogViewer className="w-[720px]" title="worker" lines={workerLog} />,
}

/** One click on a level shows only that level; another shows everything again. */
export const Soloed: Story = {
  render: () => (
    <LogViewer className="w-[720px]" title="worker" lines={workerLog} levels={['error', 'fatal']} />
  ),
}

export const WithoutToolbar: Story = {
  render: () => (
    <LogViewer
      className="w-[720px]"
      title="worker"
      lines={workerLog}
      filterable={false}
      searchable={false}
    />
  ),
}

/**
 * A level is read off the text, so output from a process that already logs one
 * needs no work. Lines that do not state a level can declare one instead.
 */
export const ExplicitLevels: Story = {
  render: () => (
    <LogViewer
      className="w-[640px]"
      title="agent"
      lines={[
        { text: 'Reading src/index.ts', level: 'debug' },
        { text: 'Applying 3 edits', level: 'info' },
        { text: 'Snapshot written', level: 'info' },
        { text: 'Typecheck failed', level: 'error' },
      ]}
    />
  ),
}

export const ATestRun: Story = {
  render: () => (
    <LogViewer
      className="w-[720px]"
      title="vitest"
      lines={[
        '\u001b[1m RUN \u001b[0m v3.2.7 \u001b[2mE:/UI-UI/UI_UI\u001b[0m',
        '\u001b[32m ✓\u001b[0m src/lib/diff.test.ts \u001b[2m(25 tests) 20ms\u001b[0m',
        '\u001b[32m ✓\u001b[0m src/lib/ansi.test.ts \u001b[2m(25 tests) 16ms\u001b[0m',
        '\u001b[31m ✗\u001b[0m src/components/Diff/Diff.test.tsx',
        '  \u001b[31mAssertionError\u001b[0m: expected 2 to be 3',
        '\u001b[33m Test Files \u001b[0m \u001b[31m1 failed\u001b[0m | \u001b[32m1 passed\u001b[0m',
      ]}
    />
  ),
}
