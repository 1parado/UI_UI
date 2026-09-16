import type { Meta, StoryObj } from '@storybook/react'
import { StreamingText } from './StreamingText'

const meta: Meta<typeof StreamingText> = {
  title: 'Components/StreamingText',
  component: StreamingText,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full text-sm leading-relaxed">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StreamingText>

export const Streaming: Story = {
  args: {
    text: 'The retry fires before the token refresh settles, so the request',
    streaming: true,
  },
}

export const Complete: Story = {
  args: {
    text: 'The retry fires before the token refresh settles. Await the refresh first.',
    streaming: false,
  },
}

export const Interrupted: Story = {
  args: {
    text: 'The retry fires before the token refresh settles, so the request keeps',
    streaming: false,
    interrupted: true,
  },
}

export const PlainParagraph: Story = {
  render: () => (
    <p>
      Streaming into an existing paragraph works too —{' '}
      <StreamingText text="tokens append in place" streaming /> without the
      layout jumping between chunks.
    </p>
  ),
}
