import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ConversationItem,
  ConversationSidebar,
  ConversationSidebarContent,
  ConversationSidebarFooter,
  ConversationSidebarGroup,
  ConversationSidebarHeader,
} from './ConversationSidebar'
import { Button } from '../Button'
import { PlusIcon } from '@/lib/icons'

const meta: Meta<typeof ConversationSidebar> = {
  title: 'Components/ConversationSidebar',
  component: ConversationSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[26rem]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ConversationSidebar>

const INITIAL: Record<string, string[]> = {
  Today: [
    'Why does retry keep getting 401?',
    'Rewrite the debounce hook',
    'Summarise the incident report',
  ],
  'Previous 7 days': [
    'Compare Radix and React Aria',
    'Tighten the CI pipeline',
    'Explain the token budget',
  ],
}

const SidebarDemo = () => {
  const [active, setActive] = React.useState('Why does retry keep getting 401?')
  const [groups, setGroups] = React.useState(INITIAL)

  const rename = (group: string, from: string, to: string) =>
    setGroups((prev) => ({
      ...prev,
      [group]: prev[group].map((title) => (title === from ? to : title)),
    }))

  const remove = (group: string, title: string) =>
    setGroups((prev) => ({
      ...prev,
      [group]: prev[group].filter((item) => item !== title),
    }))

  return (
    <ConversationSidebar>
      <ConversationSidebarHeader>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <PlusIcon className="h-3.5 w-3.5" />
          New chat
        </Button>
      </ConversationSidebarHeader>

      <ConversationSidebarContent>
        {Object.entries(groups).map(([label, titles]) => (
          <ConversationSidebarGroup key={label} label={label}>
            {titles.map((title) => (
              <ConversationItem
                key={title}
                title={title}
                active={title === active}
                onClick={() => setActive(title)}
                onRename={(next) => rename(label, title, next)}
                onDelete={() => remove(label, title)}
              />
            ))}
          </ConversationSidebarGroup>
        ))}
      </ConversationSidebarContent>

      <ConversationSidebarFooter>
        <span className="px-2 text-xs text-muted-foreground">
          12.4K / 50K tokens used
        </span>
      </ConversationSidebarFooter>
    </ConversationSidebar>
  )
}

export const Default: Story = {
  render: () => <SidebarDemo />,
}

export const ReadOnly: Story = {
  render: () => (
    <ConversationSidebar>
      <ConversationSidebarHeader>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <PlusIcon className="h-3.5 w-3.5" />
          New chat
        </Button>
      </ConversationSidebarHeader>
      <ConversationSidebarContent>
        <ConversationSidebarGroup label="Today">
          {Object.values(INITIAL).flat().map((title, index) => (
            <ConversationItem key={title} title={title} active={index === 0} />
          ))}
        </ConversationSidebarGroup>
      </ConversationSidebarContent>
    </ConversationSidebar>
  ),
}
