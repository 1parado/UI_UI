import type { Meta, StoryObj } from '@storybook/react'
import { AutoComplete } from './AutoComplete'

const branches = [
  'main',
  'master',
  'develop',
  'staging',
  'release/1.0',
  'release/2.0',
  'hotfix/login-loop',
]

const people = [
  { value: 'ada@lovelace.dev', label: 'Ada Lovelace', group: 'Engineering' },
  { value: 'grace@hopper.dev', label: 'Grace Hopper', group: 'Engineering' },
  { value: 'radia@perlman.dev', label: 'Radia Perlman', group: 'Infrastructure' },
  { value: 'margaret@hamilton.dev', label: 'Margaret Hamilton', group: 'Infrastructure' },
]

const meta = {
  title: 'Components/AutoComplete',
  component: AutoComplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A field that suggests but never insists — unlike `Combobox`, whatever you type is already valid, and the list is only a shortcut to a longer string. Suggestions are derived from the text on every keystroke, options can be bare strings, and the field keeps focus throughout (the panel suppresses its own auto-focus so typing survives the list appearing).',
      },
    },
  },
  args: {
    options: branches,
    placeholder: 'Branch name',
  },
} satisfies Meta<typeof AutoComplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Grouped: Story = {
  args: { options: people, placeholder: 'Add a reviewer' },
}

export const PrefixMatching: Story = {
  args: { filterMode: 'startsWith' },
  parameters: {
    docs: {
      description: {
        story: 'Suggestions must continue the text rather than merely contain it.',
      },
    },
  },
}

export const OnFocus: Story = {
  args: { openOnFocus: true, clearable: true },
}

export const WithKeywords: Story = {
  args: {
    options: [
      { value: 'src/components/Button.tsx', label: 'Button.tsx', keywords: ['ui', 'primary'] },
      { value: 'src/lib/diff.ts', label: 'diff.ts', keywords: ['patch', 'diff'] },
      { value: 'src/lib/anchor.ts', label: 'anchor.ts', keywords: ['scroll', 'nav'] },
    ],
    placeholder: 'Jump to file',
    maxSuggestions: 5,
  },
  parameters: {
    docs: {
      description: {
        story: '`keywords` add words that should find an option without appearing next to it.',
      },
    },
  },
}

export const KeepOpen: Story = {
  args: { keepOpen: true, clearable: true },
}
