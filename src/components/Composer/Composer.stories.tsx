import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Composer,
  ComposerHint,
  ComposerSubmit,
  ComposerTextarea,
  ComposerToolbar,
} from './Composer'
import { AttachmentList, Attachment } from '../AttachmentList'
import { ModelSelector } from '../ModelSelector'
import { Button } from '../Button'
import { PaperclipIcon } from '@/lib/icons'
import { formatCompactNumber } from '@/lib/format'

const meta: Meta<typeof Composer> = {
  title: 'Components/Composer',
  component: Composer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[42rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Composer>

const MODELS = [
  {
    value: 'gpt-5',
    name: 'GPT-5',
    group: 'Reasoning',
    description: 'Best for multi-step debugging',
    badge: '400K',
  },
  {
    value: 'gpt-5-mini',
    name: 'GPT-5 mini',
    group: 'Reasoning',
    description: 'Cheaper, still strong',
    badge: '200K',
  },
  {
    value: 'gpt-4o',
    name: 'GPT-4o',
    group: 'Fast',
    description: 'Lowest latency',
    badge: '128K',
  },
]

const DefaultDemo = () => {
  const [sent, setSent] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-3">
      <Composer onSubmit={(value) => setSent((prev) => [value, ...prev])}>
        <ComposerTextarea placeholder="Ask about your codebase…" />
        <ComposerToolbar>
          <ComposerHint>Enter to send · Shift+Enter for a new line</ComposerHint>
          <ComposerSubmit className="ml-auto" />
        </ComposerToolbar>
      </Composer>

      {sent.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {sent.slice(0, 3).map((value, index) => (
            <li key={index} className="truncate">
              Sent: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

const StreamingDemo = () => {
  const [streaming, setStreaming] = React.useState(true)

  return (
    <Composer
      streaming={streaming}
      onStop={() => setStreaming(false)}
      onSubmit={() => setStreaming(true)}
    >
      <ComposerTextarea
        defaultValue="Refactor the auth guard so refresh runs first."
        placeholder="Ask about your codebase…"
      />
      <ComposerToolbar>
        <ComposerHint>
          {streaming ? 'Generating — press stop to cancel' : 'Ready'}
        </ComposerHint>
        <ComposerSubmit className="ml-auto" />
      </ComposerToolbar>
    </Composer>
  )
}

export const Streaming: Story = {
  render: () => <StreamingDemo />,
}

export const WithAttachments: Story = {
  render: () => (
    <Composer>
      <AttachmentList>
        <Attachment name="auth-guard.ts" size="4.2 KB" />
        <Attachment name="trace.png" size="218 KB" type="image" />
      </AttachmentList>
      <ComposerTextarea placeholder="What is wrong with this guard?" />
      <ComposerToolbar>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <PaperclipIcon className="h-3.5 w-3.5" />
          <span className="sr-only">Attach files</span>
        </Button>
        <ComposerHint>2 files attached</ComposerHint>
        <ComposerSubmit className="ml-auto" />
      </ComposerToolbar>
    </Composer>
  ),
}

const ControlledWithTokenHintDemo = () => {
  const [value, setValue] = React.useState('')
  const [model, setModel] = React.useState('gpt-5')
  // Rough client-side estimate — replace with the real tokenizer.
  const estimatedTokens = Math.ceil(value.length / 4)

  return (
    <Composer value={value} onValueChange={setValue}>
      <ComposerTextarea placeholder="Ask about your codebase…" />
      <ComposerToolbar>
        <ModelSelector
          models={MODELS}
          value={model}
          onValueChange={setModel}
          className="h-8 w-auto"
        />
        <ComposerHint className="ml-auto">
          ~{formatCompactNumber(estimatedTokens)} tokens
        </ComposerHint>
        <ComposerSubmit />
      </ComposerToolbar>
    </Composer>
  )
}

export const ControlledWithTokenHint: Story = {
  render: () => <ControlledWithTokenHintDemo />,
}

export const Disabled: Story = {
  render: () => (
    <Composer>
      <ComposerTextarea placeholder="Upgrade your plan to keep chatting" disabled />
      <ComposerToolbar>
        <ComposerHint>Monthly quota reached</ComposerHint>
        <ComposerSubmit className="ml-auto" disabled />
      </ComposerToolbar>
    </Composer>
  ),
}
