import type { Meta, StoryObj } from '@storybook/react'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
}

export const Circle: Story = {
  render: () => <Skeleton className="h-12 w-12 rounded-full" />,
}

export const CardPreview: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
}

export const Paragraph: Story = {
  render: () => (
    <SkeletonText lines={4} className="w-[320px]" />
  ),
}

export const AvatarSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
    </div>
  ),
}

export const Card: Story = {
  render: () => <SkeletonCard lines={3} className="w-[320px]" />,
}

export const Table: Story = {
  render: () => <SkeletonTable rows={5} columns={4} className="w-[420px]" />,
}

export const Buttons: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SkeletonButton size="sm" />
      <SkeletonButton size="md" />
      <SkeletonButton size="lg" />
    </div>
  ),
}

/** A page standing in for itself while its data is on the way. */
export const Page: Story = {
  render: () => (
    <div className="w-[420px] space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonText lines={1} lastLineWidth={40} className="w-40" />
        <SkeletonButton />
      </div>
      <SkeletonCard lines={2} />
      <SkeletonCard lines={2} />
      <SkeletonTable rows={3} columns={3} />
    </div>
  ),
}
