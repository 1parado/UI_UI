import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, type DataTableColumn } from './DataTable'
import { Badge } from '@/components/Badge'

interface Run extends Record<string, unknown> {
  id: string
  model: string
  tokens: number
  latency: number
  status: 'Passed' | 'Failed'
}

const runs: Run[] = [
  { id: 'run_8241', model: 'gpt-4o-mini', tokens: 18204, latency: 1.2, status: 'Passed' },
  { id: 'run_8240', model: 'claude-sonnet', tokens: 31077, latency: 2.8, status: 'Passed' },
  { id: 'run_8239', model: 'gpt-4o', tokens: 9412, latency: 0.9, status: 'Failed' },
  { id: 'run_8238', model: 'claude-haiku', tokens: 22750, latency: 1.6, status: 'Passed' },
  { id: 'run_8237', model: 'gemini-2.5-pro', tokens: 14092, latency: 3.4, status: 'Passed' },
  { id: 'run_8236', model: 'gpt-4o-mini', tokens: 8130, latency: 0.7, status: 'Failed' },
  { id: 'run_8235', model: 'claude-sonnet', tokens: 26418, latency: 2.1, status: 'Passed' },
  { id: 'run_8234', model: 'gemini-2.5-flash', tokens: 11207, latency: 1.1, status: 'Passed' },
  { id: 'run_8233', model: 'gpt-4o', tokens: 34980, latency: 3.9, status: 'Passed' },
  { id: 'run_8232', model: 'claude-haiku', tokens: 6641, latency: 0.6, status: 'Failed' },
  { id: 'run_8231', model: 'gpt-4o-mini', tokens: 15733, latency: 1.4, status: 'Passed' },
  { id: 'run_8230', model: 'gemini-2.5-pro', tokens: 28904, latency: 2.6, status: 'Passed' },
]

const columns: DataTableColumn<Run>[] = [
  { key: 'id', header: 'Run', className: 'font-medium' },
  { key: 'model', header: 'Model' },
  { key: 'tokens', header: 'Tokens', align: 'right', sortable: true, className: 'tabular-nums' },
  { key: 'latency', header: 'Latency', align: 'right', sortable: true, className: 'tabular-nums' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status === 'Passed' ? 'success' : 'destructive'}>
        {row.status}
      </Badge>
    ),
    sortValue: (row) => row.status,
  },
]

const meta: Meta<typeof DataTable<Run>> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable<Run>>

export const Default: Story = {
  render: () => <DataTable data={runs} columns={columns} getRowId={(row) => row.id} />,
}

/** Sortable headers: click once for ascending, again for descending. */
export const SortedOnOpen: Story = {
  render: () => (
    <DataTable
      data={runs}
      columns={columns}
      getRowId={(row) => row.id}
      initialSort={{ key: 'tokens', direction: 'desc' }}
    />
  ),
}

export const Paginated: Story = {
  render: () => (
    <DataTable
      data={runs}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={5}
      caption="Evaluation runs"
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable
      data={[] as Run[]}
      columns={columns}
      emptyMessage="No runs match these filters."
    />
  ),
}

export const Narrow: Story = {
  render: () => (
    <div className="w-96">
      <DataTable data={runs.slice(0, 3)} columns={columns} getRowId={(row) => row.id} />
    </div>
  ),
}
