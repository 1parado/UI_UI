import type { Meta, StoryObj } from '@storybook/react'
import { VirtualList } from './VirtualList'

const meta = {
  title: 'Components/VirtualList',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Windowed list — renders the rows that are on screen and little else, so a list of ten thousand costs the same as a list of twenty. `estimateSize` should be accurate: the fast path never measures.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Row {
  id: string
  name: string
  detail: string
}

const rows: Row[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: `row-${index}`,
  name: `Document ${index + 1}`,
  detail: `${(index * 37) % 900 + 100} KB · updated ${(index % 29) + 1} days ago`,
}))

export const TenThousandRows: Story = {
  render: () => (
    <VirtualList
      className="w-[420px] rounded-lg border border-border"
      items={rows}
      estimateSize={56}
      height={400}
      getItemKey={(row) => row.id}
      renderItem={(row) => (
        <div className="flex h-14 flex-col justify-center border-b border-border px-3">
          <span className="text-sm font-medium">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.detail}</span>
        </div>
      )}
    />
  ),
}

export const UniformHeight: Story = {
  render: () => (
    <VirtualList
      className="w-[320px] rounded-lg border border-border font-mono"
      items={Array.from({ length: 5000 }, (_, index) => `line ${index + 1}`)}
      estimateSize={24}
      height={320}
      renderItem={(line) => (
        <div className="h-6 whitespace-pre px-2 text-xs leading-6 text-muted-foreground">
          {line}
        </div>
      )}
    />
  ),
}

const fetchMore = () => {
  // A real caller would append the next page here.
}

/** `onEndReached` fires once the tail of the list comes into view. */
export const InfiniteScroll: Story = {
  render: () => (
    <VirtualList
      className="w-[360px] rounded-lg border border-border"
      items={rows.slice(0, 12)}
      estimateSize={40}
      height={280}
      endReachedThreshold={2}
      onEndReached={fetchMore}
      renderItem={(row) => (
        <div className="flex h-10 items-center border-b border-border px-3 text-sm">
          {row.name}
        </div>
      )}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <VirtualList
      className="w-[360px] rounded-lg border border-border"
      items={[]}
      estimateSize={40}
      height={200}
      empty="No documents yet"
      renderItem={(row: Row) => <div>{row.name}</div>}
    />
  ),
}

/** `measure` handles rows whose height depends on their content. */
export const MeasuredRows: Story = {
  render: () => (
    <VirtualList
      className="w-[360px] rounded-lg border border-border"
      items={rows.slice(0, 200)}
      estimateSize={48}
      measure
      overscan={4}
      height={320}
      renderItem={(row, index) => (
        <div className="border-b border-border p-3">
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">
            {index % 3 === 0
              ? 'A longer description that wraps onto several lines, which is exactly why this story measures instead of estimating.'
              : row.detail}
          </p>
        </div>
      )}
    />
  ),
}
