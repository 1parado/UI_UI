import type { Meta, StoryObj } from '@storybook/react'
import { MultiSelect } from './MultiSelect'

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MultiSelect>

const regions = [
  { value: 'us-east-1', label: 'US East', description: 'N. Virginia' },
  { value: 'us-west-2', label: 'US West', description: 'Oregon' },
  { value: 'eu-west-1', label: 'EU West', description: 'Ireland' },
  { value: 'eu-central-1', label: 'EU Central', description: 'Frankfurt' },
  { value: 'ap-southeast-1', label: 'AP Southeast', description: 'Singapore' },
  { value: 'ap-northeast-1', label: 'AP Northeast', description: 'Tokyo' },
]

export const Default: Story = {
  args: {
    options: regions,
    defaultValue: ['us-east-1', 'eu-west-1'],
  },
}

export const Empty: Story = {
  args: {
    options: regions,
    placeholder: 'Choose regions…',
  },
}

/** Options sharing a `group` are collected under one heading. */
export const Grouped: Story = {
  args: {
    options: [
      { value: 'gpt-4o', label: 'GPT-4o', group: 'OpenAI' },
      { value: 'gpt-4o-mini', label: 'GPT-4o mini', group: 'OpenAI' },
      { value: 'claude-opus', label: 'Claude Opus', group: 'Anthropic' },
      { value: 'claude-sonnet', label: 'Claude Sonnet', group: 'Anthropic' },
      { value: 'qwen-max', label: 'Qwen Max', group: 'Alibaba' },
      { value: 'deepseek-v3', label: 'DeepSeek V3', group: 'DeepSeek' },
    ],
    defaultValue: ['gpt-4o', 'claude-sonnet'],
    placeholder: 'Pick models…',
  },
}

/** At the ceiling, everything not already chosen is disabled. */
export const Limited: Story = {
  args: {
    options: regions,
    defaultValue: ['us-east-1', 'eu-west-1'],
    maxSelected: 3,
  },
}

/** A disabled option is skipped by select-all and never selectable. */
export const WithDisabled: Story = {
  args: {
    options: [
      ...regions.slice(0, 4),
      { value: 'cn-north-1', label: 'CN North', description: 'Not available on your plan', disabled: true },
    ],
    defaultValue: ['us-west-2'],
  },
}

/** The select-all row sits outside the filter, so it survives a search. */
export const WithoutSelectAll: Story = {
  args: {
    options: regions,
    selectAll: false,
    defaultValue: ['ap-northeast-1'],
  },
}
