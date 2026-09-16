import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from './Message'
import { Avatar, AvatarFallback } from '../Avatar'
import { Button } from '../Button'
import { CopyIcon, RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/lib/icons'

const meta: Meta<typeof Message> = {
  title: 'Components/Message',
  component: Message,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: ['user', 'assistant', 'system'] },
  },
  decorators: [
    (Story) => (
      <div className="w-[42rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Message>

const ActionButton = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={label}>
    {children}
  </Button>
)

export const Assistant: Story = {
  args: { role: 'assistant' },
  render: (args) => (
    <Message {...args}>
      <MessageAvatar>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">AI</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <p>
          The 401 comes from the retry firing before the token refresh settles.
          Reorder the two steps and the failure disappears.
        </p>
        <MessageActions>
          <ActionButton label="Copy response">
            <CopyIcon className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Regenerate response">
            <RefreshIcon className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Good response">
            <ThumbsUpIcon className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton label="Bad response">
            <ThumbsDownIcon className="h-3.5 w-3.5" />
          </ActionButton>
        </MessageActions>
      </MessageContent>
    </Message>
  ),
}

export const User: Story = {
  args: { role: 'user' },
  render: (args) => (
    <Message {...args}>
      <MessageContent>
        Why does my retry logic keep getting a 401?
      </MessageContent>
    </Message>
  ),
}

export const System: Story = {
  args: { role: 'system' },
  render: (args) => (
    <Message {...args}>
      <MessageContent>Model switched to a 128K context window.</MessageContent>
    </Message>
  ),
}

export const Exchange: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Message role="user">
        <MessageContent>
          Why does my retry logic keep getting a 401?
        </MessageContent>
      </Message>
      <Message role="assistant">
        <MessageAvatar>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">AI</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <p>
            The retry fires before the token refresh settles. Await the refresh
            first, then retry once.
          </p>
          <MessageActions>
            <ActionButton label="Copy response">
              <CopyIcon className="h-3.5 w-3.5" />
            </ActionButton>
          </MessageActions>
        </MessageContent>
      </Message>
      <Message role="system">
        <MessageContent>Context trimmed to the last 20 turns.</MessageContent>
      </Message>
    </div>
  ),
}
