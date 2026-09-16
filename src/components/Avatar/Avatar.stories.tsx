import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Avatar>

const FALLBACK_IMG = 'https://i.pravatar.cc/150?img=12'

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={FALLBACK_IMG} alt="User avatar" />
      <AvatarFallback>UN</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      {/* broken URL -> fallback is shown automatically */}
      <AvatarImage src="https://invalid.example/avatar.png" alt="Broken avatar" />
      <AvatarFallback>BF</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14 text-base">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
}
