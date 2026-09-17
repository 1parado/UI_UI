import type { Meta, StoryObj } from '@storybook/react'
import { Timeline, TimelineItem } from './Timeline'
import { AlertCircleIcon, CheckIcon, SettingsIcon } from '@/lib/icons'

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Timeline>

export const Default: Story = {
  render: () => (
    <Timeline className="w-[420px]">
      <TimelineItem
        title="Opened pull request"
        description="feat: add the sidebar suite"
        timestamp="09:41"
        status="success"
      />
      <TimelineItem
        title="Ran CI"
        description="typecheck, lint, test, build"
        timestamp="09:44"
        status="success"
      />
      <TimelineItem
        title="Review requested"
        description="Waiting on @parado"
        timestamp="09:45"
        status="primary"
      />
      <TimelineItem
        title="Merged"
        description="Squashed into main"
        timestamp="10:02"
        status="success"
      />
    </Timeline>
  ),
}

/** Custom markers — a step number, a tool icon, an avatar. */
export const CustomMarkers: Story = {
  render: () => (
    <Timeline className="w-[420px]">
      <TimelineItem
        title="Read src/index.ts"
        timestamp="12ms"
        icon={<CheckIcon className="size-3" />}
        status="success"
      />
      <TimelineItem
        title="Edit src/app.tsx"
        timestamp="38ms"
        icon={<SettingsIcon className="size-3" />}
        status="primary"
      />
      <TimelineItem
        title="Run pnpm test"
        timestamp="failed"
        icon={<AlertCircleIcon className="size-3" />}
        status="destructive"
      />
    </Timeline>
  ),
}

/** Entries take arbitrary content — code, buttons, nested detail. */
export const WithContent: Story = {
  render: () => (
    <Timeline className="w-[420px]">
      <TimelineItem title="Deployment started" timestamp="11:20">
        <p className="mt-1 rounded-md bg-muted px-2 py-1 font-mono text-xs">
          pnpm build --mode production
        </p>
      </TimelineItem>
      <TimelineItem title="Health check passed" timestamp="11:23" status="success" />
      <TimelineItem title="Traffic shifted" timestamp="11:24" status="success" />
    </Timeline>
  ),
}
