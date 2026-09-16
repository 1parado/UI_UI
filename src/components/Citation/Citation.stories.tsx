import type { Meta, StoryObj } from '@storybook/react'
import { Citation, SourceChip } from './Citation'

const meta: Meta<typeof Citation> = {
  title: 'Components/Citation',
  component: Citation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[44rem] max-w-full text-sm leading-relaxed">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Citation>

export const Inline: Story = {
  render: () => (
    <p>
      The refresh must settle before the retry
      <Citation index={1} href="https://example.com/docs/refresh" />, otherwise
      the request goes out with an expired token
      <Citation index={2} href="https://example.com/blog/401-loops" />.
    </p>
  ),
}

export const WithoutLink: Story = {
  render: () => (
    <p>
      Model pricing changed in June
      <Citation index={3} />
      — re-check the per-token rate before shipping the cost estimate.
    </p>
  ),
}

export const SourceList: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SourceChip
        index={1}
        title="Token refresh ordering"
        source="example.com"
        href="https://example.com/docs/refresh"
      />
      <SourceChip
        index={2}
        title="Debugging 401 loops"
        source="example.com"
        href="https://example.com/blog/401-loops"
      />
      <SourceChip title="Local design notes" />
    </div>
  ),
}
