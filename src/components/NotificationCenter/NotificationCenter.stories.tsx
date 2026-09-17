import type { Meta, StoryObj } from '@storybook/react'
import { NotificationCenter, NotificationList } from './NotificationCenter'
import { Button } from '@/components/Button'
import { CheckIcon, TrashIcon, XIcon } from '@/lib/icons'

const meta: Meta<typeof NotificationCenter> = {
  title: 'Components/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NotificationCenter>

const notifications = [
  {
    id: '1',
    title: 'Deploy finished',
    description: 'ui-ui@0.4.2 is live on production.',
    timestamp: '2 minutes ago',
    tone: 'success' as const,
    icon: <CheckIcon />,
  },
  {
    id: '2',
    title: 'Build failed',
    description: 'web · tests exited with code 1.',
    timestamp: '18 minutes ago',
    tone: 'destructive' as const,
    icon: <XIcon />,
  },
  {
    id: '3',
    title: 'Usage at 82% of quota',
    timestamp: '1 hour ago',
    tone: 'warning' as const,
  },
  {
    id: '4',
    title: 'Weekly report is ready',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    title: 'Two new members joined the workspace',
    timestamp: '2 days ago',
    read: true,
  },
]

export const Default: Story = {
  args: {
    notifications,
    triggerLabel: 'Notifications',
  },
}

/** Anything can go in the footer — usually a link to the full inbox. */
export const WithFooter: Story = {
  args: {
    notifications,
    footer: (
      <a href="#" className="text-sm font-medium text-primary hover:underline">
        View all notifications
      </a>
    ),
  },
}

/** Per-row controls sit next to the heading and never nest inside it. */
export const WithActions: Story = {
  args: {
    notifications: notifications.map((item) => ({
      ...item,
      action: (
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Remove">
          <TrashIcon className="h-3.5 w-3.5" />
        </Button>
      ),
    })),
    dismissible: true,
  },
}

/** A single group of unread rows reads better without the headings. */
export const UnreadOnly: Story = {
  args: {
    notifications: notifications.filter((item) => !item.read),
  },
}

/** Nothing waiting. */
export const Empty: Story = {
  args: {
    notifications: [],
  },
}

const ListExample = () => (
  <div className="w-[380px] rounded-lg border border-border">
    <NotificationList
      notifications={notifications}
      title="Notifications"
      dismissible
      maxHeight={320}
    />
  </div>
)

/**
 * `NotificationList` is the inbox without the popover — drop it straight into
 * a notifications page.
 */
export const List: Story = {
  render: () => <ListExample />,
}
