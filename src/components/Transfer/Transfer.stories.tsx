import type { Meta, StoryObj } from '@storybook/react'
import { Transfer } from './Transfer'
import type { TransferItem } from '@/lib/transfer'

const people: TransferItem[] = [
  { key: 'ada', title: 'Ada Lovelace', description: 'Mathematics' },
  { key: 'barbara', title: 'Barbara Liskov', description: 'Languages' },
  { key: 'grace', title: 'Grace Hopper', description: 'Compilers', disabled: true },
  { key: 'radia', title: 'Radia Perlman', description: 'Networks' },
  { key: 'margaret', title: 'Margaret Hamilton', description: 'Flight software' },
  { key: 'shafi', title: 'Shafi Goldwasser', description: 'Cryptography' },
]

const meta = {
  title: 'Components/Transfer',
  component: Transfer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two lists with the gap between them doing all the work. State is only **which keys are on the right** — every panel is derived from that, so a caller can persist `targetKeys` and hand it straight back. Each side ticks its own rows, searches independently, and shows how much of it is selected; disabled rows are never ticked and never move.',
      },
    },
  },
  args: {
    dataSource: people,
    titles: ['Available', 'On the team'],
  },
} satisfies Meta<typeof Transfer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Preselected: Story = {
  args: { defaultTargetKeys: ['ada', 'radia'] },
}

export const WithDisabledRows: Story = {
  args: { defaultTargetKeys: ['grace'] },
  parameters: {
    docs: {
      description: {
        story:
          'Grace cannot be ticked, so she cannot be moved — useful for rows owned by another system.',
      },
    },
  },
}

export const WithoutHelpers: Story = {
  args: { searchable: false, showSelectAll: false },
}

export const CustomRow: Story = {
  args: {
    renderItem: (item) => (
      <span className="flex flex-col">
        <span className="truncate font-medium">{item.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {item.description} · {item.key}
        </span>
      </span>
    ),
  },
}

export const OneWay: Story = {
  args: { titles: ['Everyone', 'Reviewers'], disabled: false },
  render: (args) => (
    <div className="w-full">
      <Transfer {...args} />
      <p className="mt-3 text-xs text-muted-foreground">
        Both directions are always offered — masking one is a caller-side concern, and a tidy way
        to make a one-way flow is to hide the other button with CSS rather than lose it from the
        accessibility tree.
      </p>
    </div>
  ),
}
