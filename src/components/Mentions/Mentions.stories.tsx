import type { Meta, StoryObj } from '@storybook/react'
import { Mentions } from './Mentions'

const team = [
  { key: 'ada', label: 'Ada Lovelace', description: 'Mathematics' },
  { key: 'grace', label: 'Grace Hopper', description: 'Compilers' },
  { key: 'barbara', label: 'Barbara Liskov', description: 'Languages' },
  { key: 'radia', label: 'Radia Perlman', description: 'Networks', disabled: true },
]

const meta = {
  title: 'Components/Mentions',
  component: Mentions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A mention is not a widget, it is text with a caret in it — so nothing here is stored: on every keystroke the text before the caret decides whether a mention is open (`lib/mentions`). Escape behaving itself comes free, because there is no mode to leave. Completing a handle splices it in place instead of appending, so mentioning somebody mid-sentence keeps the sentence.',
      },
    },
  },
  args: {
    options: team,
    placeholder: 'Write a comment…',
  },
} satisfies Meta<typeof Mentions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Multiline: Story = {
  args: { multiline: true, rows: 5 },
}

export const DisabledRows: Story = {
  args: { multiline: true },
  parameters: {
    docs: {
      description: {
        story: 'Radia is away. She can be found, but not mentioned.',
      },
    },
  },
}

export const IssueTrigger: Story = {
  args: { trigger: '#', placeholder: 'Reference an issue…', multiline: true },
}

export const SpacesAllowed: Story = {
  args: { allowSpaceInQuery: true, multiline: true },
  parameters: {
    docs: {
      description: {
        story:
          'Handles with spaces need opting into: without it, a space ends the query — which is usually what you want, since a mention rarely runs past one word.',
      },
    },
  },
}

export const ShortList: Story = {
  args: { maxSuggestions: 2 },
}
