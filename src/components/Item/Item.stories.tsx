import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Avatar, AvatarFallback } from '@/components/Avatar'
import { Switch } from '@/components/Switch'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './Item'

const meta = {
  title: 'Components/Item',
  component: Item,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One row of a list — leading media, a title/description stack, trailing actions. The parts are slots, so anything can go in them; `Item` only decides layout.',
      },
    },
  },
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ItemGroup className="w-[420px]">
      <Item>
        <ItemMedia variant="icon">A</ItemMedia>
        <ItemContent>
          <ItemTitle>Atlas</ItemTitle>
          <ItemDescription>Updated 2 hours ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary">Team</Badge>
        </ItemActions>
      </Item>
      <Item>
        <ItemMedia variant="icon">B</ItemMedia>
        <ItemContent>
          <ItemTitle>Beacon</ItemTitle>
          <ItemDescription>Updated yesterday</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="outline">Personal</Badge>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-4">
      <ItemGroup variant="plain">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>outline</ItemTitle>
            <ItemDescription>A card-like row that stands alone</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>muted</ItemTitle>
            <ItemDescription>A quiet row inside a busy surface</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <ItemGroup variant="plain" className="w-[420px]">
      <Item interactive asChild>
        <a href="#atlas">
          <ItemContent>
            <ItemTitle>Open Atlas</ItemTitle>
            <ItemDescription>asChild — the row itself is the anchor</ItemDescription>
          </ItemContent>
        </a>
      </Item>
      <Item interactive onClick={() => {}}>
        <ItemContent>
          <ItemTitle>Open Beacon</ItemTitle>
          <ItemDescription>A div with a click handler and a focus ring</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const Selected: Story = {
  render: () => (
    <ItemGroup variant="plain" className="w-[420px]">
      <Item interactive selected>
        <ItemContent>
          <ItemTitle>Claude 4.5 Sonnet</ItemTitle>
          <ItemDescription>200k context · fast</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge>Selected</Badge>
        </ItemActions>
      </Item>
      <Item interactive>
        <ItemContent>
          <ItemTitle>GPT-5</ItemTitle>
          <ItemDescription>128k context</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const WithAvatarAndSwitch: Story = {
  render: () => (
    <ItemGroup className="w-[420px]">
      <Item>
        <ItemMedia>
          <Avatar className="size-9">
            <AvatarFallback>JL</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jia Le</ItemTitle>
          <ItemDescription>jia.le@example.com</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch defaultChecked aria-label="Enable notifications" />
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <Avatar className="size-9">
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Mika</ItemTitle>
          <ItemDescription>mika@example.com</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch aria-label="Enable notifications" />
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const AsAGrid: Story = {
  render: () => (
    <ItemGroup variant="grid" className="w-[560px]">
      {['Usage', 'Billing', 'Members', 'API keys'].map((label) => (
        <Item key={label} variant="outline" interactive asChild>
          <a href={`#${label}`}>
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
              <ItemDescription>Settings</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      ))}
    </ItemGroup>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <div className="w-[420px]">
      <Item variant="outline" className="flex-col items-stretch gap-2">
        <ItemContent>
          <ItemTitle>Deploy to production</ItemTitle>
          <ItemDescription>Runs the release workflow on main</ItemDescription>
        </ItemContent>
        <ItemActions className="justify-end">
          <Button size="sm" variant="outline">
            Cancel
          </Button>
          <Button size="sm">Deploy</Button>
        </ItemActions>
      </Item>
    </div>
  ),
}
