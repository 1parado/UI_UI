import type { Meta, StoryObj } from '@storybook/react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard'
import { Avatar, AvatarFallback } from '@/components/Avatar'

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger className="rounded-sm text-sm font-medium underline underline-offset-4">
        @paradox
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>PL</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Paradox Labs</span>
            <span className="text-sm text-muted-foreground">
              Maintainer of @paradox/ui. Frontend, CLI tooling and agent
              surfaces.
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const CitationPreview: Story = {
  render: () => (
    <p className="max-w-md text-sm leading-relaxed">
      Radix handles the focus trap and escape handling
      <HoverCard>
        <HoverCardTrigger className="ml-1 cursor-help rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
          [1]
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Radix Primitives — Dialog</span>
            <span className="text-xs text-muted-foreground">
              radix-ui.com/primitives/docs/components/dialog
            </span>
            <p className="text-sm text-muted-foreground">
              Traps focus inside the content, restores it on close, and locks
              page scroll while open.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      , so the component only needs to bring the styling.
    </p>
  ),
}

export const OpenByDefault: Story = {
  render: () => (
    <HoverCard open>
      <HoverCardTrigger className="text-sm underline underline-offset-4">
        Hover target
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm text-muted-foreground">
          Forced open so the panel is visible in a static screenshot.
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
}
