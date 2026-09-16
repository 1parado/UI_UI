import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Combobox, ComboboxMultiple, type ComboboxOption } from './Combobox'

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Combobox>

const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'vite', label: 'Vite' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
]

const models: ComboboxOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI' },
  { value: 'claude-opus', label: 'Claude Opus', description: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google' },
  { value: 'llama-3', label: 'Llama 3 70B', description: 'Self-hosted' },
  { value: 'qwen-max', label: 'Qwen Max', description: 'Alibaba Cloud' },
]

function SingleDemo() {
  const [value, setValue] = React.useState('vite')

  return <Combobox options={frameworks} value={value} onValueChange={setValue} placeholder="Pick a framework" />
}

export const Default: Story = {
  render: () => <SingleDemo />,
}

/** Descriptions are searchable too, so "anthropic" finds Claude Opus. */
function WithDescriptionsDemo() {
  const [value, setValue] = React.useState('')

  return (
    <Combobox
      options={models}
      value={value}
      onValueChange={setValue}
      placeholder="Select a model"
      searchPlaceholder="Search models…"
      width="18rem"
    />
  )
}

export const WithDescriptions: Story = {
  render: () => <WithDescriptionsDemo />,
}

/** Multi-select keeps every pick as a removable chip on the trigger. */
function MultipleDemo() {
  const [value, setValue] = React.useState<string[]>(['next', 'astro'])

  return (
    <ComboboxMultiple
      options={frameworks}
      value={value}
      onValueChange={setValue}
      placeholder="Pick frameworks"
      width="20rem"
    />
  )
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
}

/** Disabled options stay visible and searchable, but cannot be picked. */
function WithDisabledOptionsDemo() {
  const [value, setValue] = React.useState('')

  return (
    <Combobox
      options={[
        { value: 'free', label: 'Free' },
        { value: 'team', label: 'Team', description: 'Seats available' },
        { value: 'business', label: 'Business', description: 'Sold out', disabled: true },
        { value: 'enterprise', label: 'Enterprise', description: 'Talk to sales' },
      ]}
      value={value}
      onValueChange={setValue}
      placeholder="Select a plan"
    />
  )
}

export const WithDisabledOptions: Story = {
  render: () => <WithDisabledOptionsDemo />,
}

export const Disabled: Story = {
  render: () => (
    <Combobox options={frameworks} placeholder="Unavailable" disabled />
  ),
}

export const CustomEmptyMessage: Story = {
  render: () => (
    <Combobox
      options={frameworks}
      placeholder="Pick a framework"
      emptyMessage="No framework matches that."
    />
  ),
}
