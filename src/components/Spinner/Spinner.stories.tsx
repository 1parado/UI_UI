import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = { render: () => <Spinner /> }

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="default" />
      <Spinner size="lg" />
    </div>
  ),
}

/** Pair it with text; pass `label={null}` so nothing is announced twice. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner size="sm" label={null} />
      Generating response…
    </div>
  ),
}

export const InButtonRow: Story = {
  render: () => (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Spinner size="sm" label={null} />
      <span className="font-mono">web_search</span>
      <span>·</span>
      <span>running</span>
    </div>
  ),
}
