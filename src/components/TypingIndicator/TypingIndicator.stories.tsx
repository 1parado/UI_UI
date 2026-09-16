import type { Meta, StoryObj } from '@storybook/react'
import { TypingIndicator } from './TypingIndicator'
import { Message, MessageAvatar, MessageContent } from '../Message'
import { Avatar, AvatarFallback } from '../Avatar'

const meta: Meta<typeof TypingIndicator> = {
  title: 'Components/TypingIndicator',
  component: TypingIndicator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TypingIndicator>

export const Default: Story = {}

export const CustomLabel: Story = {
  args: { label: 'Searching your documents' },
}

export const InsideMessage: Story = {
  render: () => (
    <div className="w-[42rem] max-w-full">
      <Message role="assistant">
        <MessageAvatar>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">AI</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <TypingIndicator />
        </MessageContent>
      </Message>
    </div>
  ),
}
