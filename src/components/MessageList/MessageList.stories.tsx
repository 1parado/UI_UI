import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MessageList, type MessageListHandle } from './MessageList'
import {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from '../Message'
import { Avatar, AvatarFallback } from '../Avatar'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { ToolCallCard, ToolCallCode, ToolCallSection } from '../ToolCallCard'
import { SourceChip } from '../Citation'
import { Feedback } from '../Feedback'
import { TypingIndicator } from '../TypingIndicator'
import {
  Composer,
  ComposerHint,
  ComposerSubmit,
  ComposerTextarea,
  ComposerToolbar,
} from '../Composer'

const meta: Meta<typeof MessageList> = {
  title: 'Components/MessageList',
  component: MessageList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[32rem] w-[46rem] max-w-full overflow-hidden rounded-lg border">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MessageList>

const AssistantAvatar = () => (
  <MessageAvatar>
    <Avatar className="h-8 w-8">
      <AvatarFallback className="text-xs">AI</AvatarFallback>
    </Avatar>
  </MessageAvatar>
)

const REPORT = `### Why the retry returns 401

The retry fires **before** the token refresh settles, so the request goes out
with the expired access token.

\`\`\`ts
await refreshToken()   // settle the refresh first
return http(config)    // then retry once
\`\`\`

| Step | Owner | Failure mode |
| --- | --- | --- |
| Refresh | auth store | 401 loop when skipped |
| Retry | http client | duplicate writes |`

export const Transcript: Story = {
  render: () => (
    <MessageList>
      <Message role="user">
        <MessageContent>
          Why does my retry logic keep getting a 401?
        </MessageContent>
      </Message>

      <Message role="assistant">
        <AssistantAvatar />
        <MessageContent>
          <ToolCallCard
            name="web_search"
            status="success"
            summary="token refresh ordering"
            durationMs={842}
          >
            <ToolCallSection label="Parameters">
              <ToolCallCode>{`{ "query": "oauth refresh before retry", "limit": 5 }`}</ToolCallCode>
            </ToolCallSection>
          </ToolCallCard>

          <MarkdownRenderer>{REPORT}</MarkdownRenderer>

          <div className="flex flex-wrap gap-2">
            <SourceChip
              index={1}
              title="Token refresh ordering"
              source="example.com"
              href="https://example.com/docs/refresh"
            />
          </div>

          <MessageActions>
            <Feedback onRegenerate={() => undefined} />
          </MessageActions>
        </MessageContent>
      </Message>

      <Message role="system">
        <MessageContent>Context trimmed to the last 20 turns.</MessageContent>
      </Message>
    </MessageList>
  ),
}

const AutoScrollDemo = () => {
  const listRef = React.useRef<MessageListHandle>(null)
  const timerRef = React.useRef(0)
  const [text, setText] = React.useState('')

  React.useEffect(() => () => window.clearInterval(timerRef.current), [])

  const stream = () => {
    let index = 0
    window.clearInterval(timerRef.current)
    setText('')
    timerRef.current = window.setInterval(() => {
      index += 14
      setText(REPORT.slice(0, index))
      if (index >= REPORT.length) window.clearInterval(timerRef.current)
    }, 40)
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList ref={listRef} className="flex-1">
        <Message role="assistant">
          <AssistantAvatar />
          <MessageContent>
            <MarkdownRenderer>{text}</MarkdownRenderer>
          </MessageContent>
        </Message>
      </MessageList>
      <div className="flex items-center gap-2 border-t p-2">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={stream}
        >
          Stream tokens
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => listRef.current?.scrollToBottom()}
        >
          Anchor to bottom
        </button>
      </div>
    </div>
  )
}

/**
 * Append tokens and the viewport follows — until you scroll up, at which point
 * following pauses and the jump-to-latest button appears.
 */
export const AutoScroll: Story = {
  render: () => <AutoScrollDemo />,
}

export const WithTypingIndicator: Story = {
  render: () => (
    <MessageList>
      <Message role="user">
        <MessageContent>Summarise the incident report.</MessageContent>
      </Message>
      <Message role="assistant">
        <AssistantAvatar />
        <MessageContent>
          <TypingIndicator />
        </MessageContent>
      </Message>
    </MessageList>
  ),
}

const FULL_REPLY = `### Why the retry returns 401

The retry fires **before** the token refresh settles, so the request goes out
with the expired access token.

1. Await the refresh call.
2. Re-read the token from the store.
3. Retry exactly once with \`maxRetries: 0\`.

\`\`\`ts
async function requestWithRefresh(config: RequestConfig) {
  try {
    return await http(config)
  } catch (error) {
    if (!isUnauthorized(error)) throw error
    await refreshToken()
    return http(config)
  }
}
\`\`\`

See the [refresh middleware docs](https://example.com/docs/refresh) for the
ordering rules.`

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const HISTORY: ChatMessage[] = [
  { id: 1, role: 'user', content: 'Why does my retry logic keep getting a 401?' },
  { id: 2, role: 'assistant', content: FULL_REPLY },
]

const FullChatDemo = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>(HISTORY)
  const [streaming, setStreaming] = React.useState(false)
  const timerRef = React.useRef(0)

  React.useEffect(() => () => window.clearInterval(timerRef.current), [])

  const stop = () => {
    window.clearInterval(timerRef.current)
    setStreaming(false)
    setMessages((prev) =>
      prev.map((message) =>
        message.streaming ? { ...message, streaming: false } : message
      )
    )
  }

  const send = (value: string) => {
    const replyId = Date.now() + 1
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: value },
      { id: replyId, role: 'assistant', content: '', streaming: true },
    ])
    setStreaming(true)

    let index = 0
    window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      index += 12
      setMessages((prev) =>
        prev.map((message) =>
          message.id === replyId
            ? { ...message, content: FULL_REPLY.slice(0, index) }
            : message
        )
      )
      if (index >= FULL_REPLY.length) {
        window.clearInterval(timerRef.current)
        setStreaming(false)
        setMessages((prev) =>
          prev.map((message) =>
            message.id === replyId ? { ...message, streaming: false } : message
          )
        )
      }
    }, 45)
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList className="flex-1">
        {messages.map((message) => (
          <Message key={message.id} role={message.role}>
            {message.role === 'assistant' && <AssistantAvatar />}
            <MessageContent>
              {message.streaming && !message.content ? (
                <TypingIndicator />
              ) : (
                <MarkdownRenderer>{message.content}</MarkdownRenderer>
              )}
              {message.role === 'assistant' && !message.streaming && (
                <MessageActions>
                  <Feedback onRegenerate={() => undefined} />
                </MessageActions>
              )}
            </MessageContent>
          </Message>
        ))}
      </MessageList>

      <div className="border-t p-3">
        <Composer streaming={streaming} onStop={stop} onSubmit={send}>
          <ComposerTextarea placeholder="Ask about your codebase…" />
          <ComposerToolbar>
            <ComposerHint>Enter to send · Shift+Enter for a new line</ComposerHint>
            <ComposerSubmit className="ml-auto" />
          </ComposerToolbar>
        </Composer>
      </div>
    </div>
  )
}

/** The whole surface working together: stream, stop, stick-to-bottom, feedback. */
export const FullChat: Story = {
  render: () => <FullChatDemo />,
}
