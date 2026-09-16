import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Feedback } from './Feedback'
import { Message, MessageActions, MessageContent } from '../Message'

const meta: Meta<typeof Feedback> = {
  title: 'Components/Feedback',
  component: Feedback,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Feedback>

export const Default: Story = {
  args: { onRegenerate: () => undefined },
}

const ReratedDemo = () => {
  const [value, setValue] = React.useState<'up' | 'down' | null>('up')

  return (
    <div className="flex flex-col gap-2">
      <Feedback
        value={value}
        onValueChange={setValue}
        onRegenerate={() => undefined}
      />
      <p className="text-xs text-muted-foreground">
        Rating: {value ?? 'none'} — click the active thumb to clear it.
      </p>
    </div>
  )
}

export const Rerated: Story = {
  render: () => <ReratedDemo />,
}

export const WithoutRegenerate: Story = {
  args: { defaultValue: 'down' },
}

export const InMessageActions: Story = {
  render: () => (
    <div className="w-[42rem]">
      <Message role="assistant">
        <MessageContent>
          <p>Await the refresh first, then retry once.</p>
          <MessageActions>
            <Feedback onRegenerate={() => undefined} />
          </MessageActions>
        </MessageContent>
      </Message>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-muted-foreground">Unrated</span>
        <Feedback />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-muted-foreground">Up</span>
        <Feedback defaultValue="up" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-muted-foreground">Down</span>
        <Feedback defaultValue="down" />
      </div>
    </div>
  ),
}
