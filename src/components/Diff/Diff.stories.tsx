import type { Meta, StoryObj } from '@storybook/react'
import { Diff, CodeDiff } from './Diff'

const meta: Meta<typeof Diff> = {
  title: 'Components/Diff',
  component: Diff,
  tags: ['autodocs'],
  args: {
    before: `export function greet(name: string) {\n  const greeting = 'Hello'\n  return \`\${greeting}, \${name}!\`\n}\n`,
    after: `export function greet(name: string) {\n  const greeting = 'Hi'\n  return \`\${greeting}, \${name}!\`\n}\n`,
  },
}

export default meta
type Story = StoryObj<typeof Diff>

export const Default: Story = {
  args: { className: 'w-[560px]' },
}

/** `CodeDiff` is the same engine with the header, the counts and the copy action. */
export const WithHeader: Story = {
  render: (args) => <CodeDiff {...args} filename="src/greet.ts" language="typescript" />,
  args: { className: 'w-[640px]' },
}

const before = [
  "import { createServer } from 'node:http'",
  '',
  'const PORT = 3000',
  '',
  'const server = createServer((request, response) => {',
  '  if (request.url === "/health") {',
  '    response.writeHead(200)',
  '    response.end("ok")',
  '    return',
  '  }',
  '',
  '  response.writeHead(200, { "content-type": "text/plain" })',
  '  response.end("hello")',
  '})',
  '',
  'server.listen(PORT)',
  '',
  'const shutdown = () => {',
  '  server.close()',
  '}',
  '',
  'process.on("SIGTERM", shutdown)',
  'process.on("SIGINT", shutdown)',
].join('\n')

const after = [
  "import { createServer } from 'node:http'",
  '',
  'const PORT = Number(process.env.PORT ?? 3000)',
  '',
  'const server = createServer((request, response) => {',
  '  if (request.url === "/health") {',
  '    response.writeHead(200)',
  '    response.end("ok")',
  '    return',
  '  }',
  '',
  '  response.writeHead(200, { "content-type": "text/plain" })',
  '  response.end("hello")',
  '})',
  '',
  'server.listen(PORT, () => {',
  '  console.log(`listening on ${PORT}`)',
  '})',
  '',
  'const shutdown = () => {',
  '  server.close()',
  '}',
  '',
  'process.on("SIGTERM", shutdown)',
  'process.on("SIGINT", shutdown)',
].join('\n')

/**
 * Unchanged runs collapse into a fold row. The two edits here are 14 lines
 * apart, which is more than twice the context, so they stay separate hunks.
 */
export const CollapsedRuns: Story = {
  render: (args) => <CodeDiff {...args} filename="server.mjs" language="javascript" />,
  args: { before, after, className: 'w-[680px]' },
}

/** The same pair side by side. Each side gets half the width and clips overflow. */
export const Split: Story = {
  render: (args) => <CodeDiff {...args} filename="server.mjs" defaultView="split" />,
  args: { before, after, className: 'w-[760px]' },
}

/** Pass `wrap` when the lines are longer than the panel. */
export const Wrapped: Story = {
  args: {
    before:
      'const message = "the quick brown fox jumps over the lazy dog and keeps on running past the edge of the panel"',
    after:
      'const message = "the quick brown fox jumps over the lazy dog, then stops to think about what it is doing"',
    wrap: true,
    className: 'w-[420px]',
  },
}

/** With `wrap` off the same content scrolls instead. */
export const Scrolling: Story = {
  args: {
    before:
      'const message = "the quick brown fox jumps over the lazy dog and keeps on running past the edge of the panel"',
    after:
      'const message = "the quick brown fox jumps over the lazy dog, then stops to think about what it is doing"',
    className: 'w-[420px]',
  },
}

/** `context={0}` strips the unchanged lines entirely. */
export const ChangesOnly: Story = {
  render: (args) => <CodeDiff {...args} filename="server.mjs" context={0} />,
  args: { before, after, className: 'w-[680px]' },
}

/** Identical input is stated rather than rendered as a wall of context. */
export const NoChanges: Story = {
  render: (args) => <CodeDiff {...args} filename="greet.ts" />,
  args: {
    before: 'const answer = 42\n',
    after: 'const answer = 42\n',
    className: 'w-[560px]',
  },
}

/**
 * Without `showHeader` the diff is the bare body, for a panel whose surrounding
 * chrome already names the file.
 */
export const Headerless: Story = {
  args: { className: 'w-[560px]' },
}

/** A new file, a deleted file, and a one-line change. */
export const EdgeCases: Story = {
  render: () => (
    <div className="grid w-[680px] gap-4">
      <CodeDiff filename="new-file.ts" before="" after={'export const x = 1\nexport const y = 2\n'} />
      <CodeDiff filename="deleted.ts" before={'export const x = 1\n'} after="" />
      <CodeDiff filename="one-line.ts" before={'const a = 1\n'} after={'const a = 2\n'} />
    </div>
  ),
}

/** Every user-facing string can be replaced, folds included. */
export const Localised: Story = {
  render: (args) => (
    <CodeDiff
      {...args}
      filename="server.mjs"
      labels={{
        unchangedLines: (count: number) => `展开 ${count} 行未改动内容`,
        identical: '两侧内容完全一致',
        unified: '统一视图',
        split: '并排视图',
        copy: '复制补丁',
        copied: '已复制',
      }}
    />
  ),
  args: { before, after, className: 'w-[680px]' },
}
