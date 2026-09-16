import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from './ScrollArea'

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScrollArea>

const releases = [
  { version: '0.1.0', note: 'Button, Input, Card' },
  { version: '0.2.0', note: 'Badge, Alert, Skeleton, Progress, Label, Textarea, Switch, Avatar' },
  { version: '0.3.0', note: 'Checkbox, RadioGroup, Select, Slider' },
  { version: '0.4.0', note: 'Dialog, Popover, Tooltip, DropdownMenu' },
  { version: '0.5.0', note: 'Toast, Tabs, Separator, Empty' },
  { version: '0.6.0', note: 'ScrollArea and the AI surfaces' },
]

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-56 w-80 rounded-lg border">
      <div className="flex flex-col gap-1 p-3">
        {[...releases, ...releases].map((release, index) => (
          <div key={index} className="rounded-md px-2 py-1.5 text-sm">
            <span className="font-medium">v{release.version}</span>
            <span className="ml-2 text-muted-foreground">{release.note}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-80 rounded-lg border">
      <div className="flex w-max gap-2 p-3">
        {[
          'claude-sonnet',
          'gpt-5-mini',
          'gemini-flash',
          'llama-4-405b',
          'qwen3-max',
          'deepseek-v3',
        ].map((model) => (
          <div
            key={model}
            className="rounded-md border px-3 py-1.5 text-sm whitespace-nowrap"
          >
            {model}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
