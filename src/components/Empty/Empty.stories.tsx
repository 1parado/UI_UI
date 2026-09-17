import type { Meta, StoryObj } from '@storybook/react'
import { Empty, EmptyTitle, EmptyDescription } from './Empty'
import { EmptyIllustration } from './EmptyIllustration'
import { emptyPresets, type EmptyPreset } from '@/lib/empty'
import { Button } from '../Button'

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Empty>

export const Default: Story = {
  render: () => (
    <Empty className="w-[360px] rounded-lg border border-dashed">
      <EmptyTitle>No projects yet</EmptyTitle>
      <EmptyDescription>
        Get started by creating a new project. All your projects will show
        up here.
      </EmptyDescription>
    </Empty>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Empty className="w-[360px] rounded-lg border border-dashed">
      <EmptyTitle>No invitations</EmptyTitle>
      <EmptyDescription>
        When someone invites you to a workspace, it will appear here.
      </EmptyDescription>
      <Button variant="outline" className="mt-2">
        Refresh
      </Button>
    </Empty>
  ),
}

export const Preset: StoryObj<{ preset: EmptyPreset }> = {
  args: { preset: 'inbox' },
  argTypes: {
    preset: {
      control: 'select',
      options: Object.keys(emptyPresets),
    },
  },
  render: ({ preset }) => {
    const copy = emptyPresets[preset]

    return (
      <Empty className="w-[360px] rounded-lg border border-dashed">
        <EmptyIllustration name={preset} />
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </Empty>
    )
  },
}

/**
 * Every drawing in the set, with the copy that goes with it — the fastest way
 * to see whether one of them fits the screen you are building.
 */
export const AllPresets: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(emptyPresets) as EmptyPreset[]).map((preset) => (
        <Empty
          key={preset}
          className="rounded-lg border border-dashed"
        >
          <EmptyIllustration name={preset} />
          <EmptyTitle>{emptyPresets[preset].title}</EmptyTitle>
          <EmptyDescription>{emptyPresets[preset].description}</EmptyDescription>
        </Empty>
      ))}
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Empty className="w-[360px] rounded-lg border border-dashed">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-muted-foreground/50"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <EmptyTitle>Nothing downloaded</EmptyTitle>
      <EmptyDescription>
        Your downloaded files will appear here once you save them.
      </EmptyDescription>
    </Empty>
  ),
}
