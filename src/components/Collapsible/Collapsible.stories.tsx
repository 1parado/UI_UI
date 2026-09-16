import type { Meta, StoryObj } from '@storybook/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible'
import { Badge } from '@/components/Badge'

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[28rem] space-y-2">
      <CollapsibleTrigger className="rounded-md border px-3 py-2">
        <span className="flex items-center gap-2">
          <span className="font-mono text-sm">web_search</span>
          <Badge variant="secondary">3 results</Badge>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-md border bg-muted/40 px-3 py-2">
        <p>
          Queried <span className="font-mono">react-day-picker v9 migration</span>{' '}
          and kept the top three hits. Full HTML stripped before returning.
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const OpenByDefault: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[28rem] space-y-2">
      <CollapsibleTrigger className="rounded-md border px-3 py-2">
        Advanced settings
      </CollapsibleTrigger>
      <CollapsibleContent>
        Sampling temperature, max output tokens and stop sequences live here.
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Collapsible disabled className="w-[28rem] space-y-2">
      <CollapsibleTrigger className="rounded-md border px-3 py-2">
        Audit log
      </CollapsibleTrigger>
      <CollapsibleContent>Requires an admin role.</CollapsibleContent>
    </Collapsible>
  ),
}
