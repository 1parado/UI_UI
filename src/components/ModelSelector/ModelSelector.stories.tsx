import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ModelSelector } from './ModelSelector'

const meta: Meta<typeof ModelSelector> = {
  title: 'Components/ModelSelector',
  component: ModelSelector,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ModelSelector>

const MODELS = [
  {
    value: 'gpt-5',
    name: 'GPT-5',
    group: 'Reasoning',
    description: 'Best for multi-step debugging',
    badge: '400K',
  },
  {
    value: 'gpt-5-mini',
    name: 'GPT-5 mini',
    group: 'Reasoning',
    description: 'Cheaper, still strong',
    badge: '200K',
  },
  {
    value: 'claude-sonnet',
    name: 'Claude Sonnet',
    group: 'Balanced',
    description: 'Long documents, careful edits',
    badge: '200K',
  },
  {
    value: 'gpt-4o',
    name: 'GPT-4o',
    group: 'Fast',
    description: 'Lowest latency',
    badge: '128K',
  },
]

export const Default: Story = {
  args: { models: MODELS, defaultValue: 'gpt-5' },
  render: (args) => (
    <div className="w-72">
      <ModelSelector {...args} />
    </div>
  ),
}

export const Placeholder: Story = {
  args: { models: MODELS },
  render: (args) => (
    <div className="w-72">
      <ModelSelector {...args} />
    </div>
  ),
}

const UNGROUPED = MODELS.map((model) => ({
  value: model.value,
  name: model.name,
  description: model.description,
  badge: model.badge,
}))

export const Ungrouped: Story = {
  args: {
    models: UNGROUPED,
    defaultValue: 'gpt-4o',
  },
  render: (args) => (
    <div className="w-72">
      <ModelSelector {...args} />
    </div>
  ),
}

const ControlledDemo = () => {
  const [model, setModel] = React.useState('gpt-5-mini')
  const current = MODELS.find((item) => item.value === model)

  return (
    <div className="flex w-72 flex-col gap-2">
      <ModelSelector models={MODELS} value={model} onValueChange={setModel} />
      <p className="text-xs text-muted-foreground">
        {current?.description} · {current?.badge} context
      </p>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const Disabled: Story = {
  args: { models: MODELS, defaultValue: 'gpt-5', disabled: true },
  render: (args) => (
    <div className="w-72">
      <ModelSelector {...args} />
    </div>
  ),
}
