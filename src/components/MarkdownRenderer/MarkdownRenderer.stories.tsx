import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownRenderer } from './MarkdownRenderer'

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[44rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MarkdownRenderer>

const answer = `### Why the retry returns 401

The retry fires **before** the token refresh settles, so the request goes out
with the expired access token.

1. Await the refresh call.
2. Re-read the token from the store.
3. Retry exactly once with \`maxRetries: 0\`.

> A retry that does not await the refresh is just a faster way to fail.

\`\`\`ts
async function requestWithRefresh(config: RequestConfig) {
  try {
    return await http(config)
  } catch (error) {
    if (!isUnauthorized(error)) throw error

    await refreshToken()          // settle the refresh first
    return http(config)           // then retry once
  }
}
\`\`\`

| Step | Owner | Failure mode |
| --- | --- | --- |
| Refresh | auth store | 401 loop when skipped |
| Retry | http client | duplicate writes |

See the [refresh middleware docs](https://example.com/docs/refresh) for the
full ordering rules.`

export const Default: Story = {
  args: { children: answer },
}

export const CodeHeavy: Story = {
  args: {
    children: `Inline \`useState\` stays inline, fenced blocks get a header and a copy button.

\`\`\`tsx
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
\`\`\`

\`\`\`json
{
  "model": "gpt-5",
  "temperature": 0.2,
  "stream": true
}
\`\`\``,
  },
}

export const GfmTables: Story = {
  args: {
    children: `- [x] Token refresh awaited
- [ ] Retry capped at one attempt
- [ ] Telemetry on second failures

| Metric | Before | After |
| --- | ---: | ---: |
| 401 errors / day | 1,284 | 12 |
| p95 latency | 940 ms | 910 ms |`,
  },
}

export const LongTokens: Story = {
  args: {
    children: `Inline tokens can be interrupted: model names like
\`anthropic/claude-sonnet-4-20250514\` and URLs like
https://example.com/a/very/long/path/that/should/wrap/instead/of/overflowing/the/message/body
both wrap instead of pushing the layout wide.`,
  },
}
