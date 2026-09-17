import type { Meta, StoryObj } from '@storybook/react'
import {
  List,
  ListDescription,
  ListHeader,
  ListItem,
  ListItemActions,
  ListItemContent,
  ListTitle,
} from './List'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Avatar, AvatarFallback } from '@/components/Avatar'

const members = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Owner', note: 'Mathematics' },
  { id: 'barbara', name: 'Barbara Liskov', role: 'Maintainer', note: 'Languages' },
  { id: 'radia', name: 'Radia Perlman', role: 'Maintainer', note: 'Networks' },
]

const meta = {
  title: 'Components/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A list with the boring parts already decided. Rows are easy; what every screen rewrites is what sits above them, what sits below, and what appears when there is nothing to show — so those are slots here, along with divider lines, padding and the skeleton rows that stop a fetching list looking empty for half a second. `items` and `children` are alternatives, never both.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['bare', 'card'] },
  },
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <List
      {...args}
      divided
      items={members}
      keyOf={(member) => member.id}
      renderItem={(member) => (
        <ListItem interactive>
          <Avatar>
            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <ListItemContent>
            <ListTitle>{member.name}</ListTitle>
            <ListDescription>{member.note}</ListDescription>
          </ListItemContent>
          <ListItemActions>
            <Badge variant="secondary">{member.role}</Badge>
          </ListItemActions>
        </ListItem>
      )}
    />
  ),
}

export const InsideACard: Story = {
  render: (args) => (
    <List
      {...args}
      variant="card"
      divided
      header={
        <ListHeader>
          <ListTitle>Team</ListTitle>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </ListHeader>
      }
      footer={
        <ListDescription className="text-center">
          3 of 8 seats used
        </ListDescription>
      }
      items={members}
      keyOf={(member) => member.id}
      renderItem={(member) => (
        <ListItem interactive>
          <ListItemContent>
            <ListTitle>{member.name}</ListTitle>
            <ListDescription>{member.note}</ListDescription>
          </ListItemContent>
          <ListItemActions>
            <Badge variant="secondary">{member.role}</Badge>
          </ListItemActions>
        </ListItem>
      )}
    />
  ),
}

export const ComposedWithChildren: Story = {
  render: (args) => (
    <List {...args} divided size="lg">
      <ListItem interactive>
        <ListItemContent>
          <ListTitle>Notifications</ListTitle>
          <ListDescription>Email me when a run finishes</ListDescription>
        </ListItemContent>
        <ListItemActions>
          <Button size="sm" variant="ghost">
            Change
          </Button>
        </ListItemActions>
      </ListItem>
      <ListItem interactive>
        <ListItemContent>
          <ListTitle>Two-factor</ListTitle>
          <ListDescription>Required for everyone on this plan</ListDescription>
        </ListItemContent>
        <ListItemActions>
          <Badge>On</Badge>
        </ListItemActions>
      </ListItem>
      <ListItem disabled>
        <ListItemContent>
          <ListTitle>Transfer ownership</ListTitle>
          <ListDescription>Only owners can do this</ListDescription>
        </ListItemContent>
      </ListItem>
    </List>
  ),
}

export const Empty: Story = {
  render: (args) => (
    <List
      {...args}
      variant="card"
      items={[]}
      header={<ListTitle>Runs</ListTitle>}
      emptyText="No runs have finished yet."
    />
  ),
}

export const Loading: Story = {
  render: (args) => (
    <List {...args} variant="card" loading skeletonCount={4} header={<ListTitle>Activity</ListTitle>} />
  ),
}
