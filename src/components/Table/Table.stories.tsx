import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table'
import { Badge } from '@/components/Badge'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Table>

const runs = [
  { id: 'run_8241', model: 'gpt-4o-mini', tokens: '18,204', latency: '1.2s', status: 'Passed' },
  { id: 'run_8240', model: 'claude-sonnet', tokens: '31,077', latency: '2.8s', status: 'Passed' },
  { id: 'run_8239', model: 'gpt-4o', tokens: '9,412', latency: '0.9s', status: 'Failed' },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Last three evaluation runs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Run</TableHead>
          <TableHead>Model</TableHead>
          <TableHead className="text-right">Tokens</TableHead>
          <TableHead className="text-right">Latency</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="font-medium">{run.id}</TableCell>
            <TableCell>{run.model}</TableCell>
            <TableCell className="text-right tabular-nums">{run.tokens}</TableCell>
            <TableCell className="text-right tabular-nums">{run.latency}</TableCell>
            <TableCell>
              <Badge variant={run.status === 'Passed' ? 'success' : 'destructive'}>
                {run.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/** `TableFooter` keeps totals visually anchored to the data above. */
export const WithTotals: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">Seats</TableHead>
          <TableHead className="text-right">Monthly</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Team</TableCell>
          <TableCell className="text-right tabular-nums">24</TableCell>
          <TableCell className="text-right tabular-nums">$480.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Enterprise</TableCell>
          <TableCell className="text-right tabular-nums">160</TableCell>
          <TableCell className="text-right tabular-nums">$4,800.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right tabular-nums">184</TableCell>
          <TableCell className="text-right tabular-nums">$5,280.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

/** A wide table scrolls inside its own container instead of the page. */
export const WideAndScrollable: Story = {
  render: () => (
    <div className="w-96">
      <Table>
        <TableHeader>
          <TableRow>
            {['Run', 'Model', 'Prompt tokens', 'Completion tokens', 'Cost', 'Latency', 'Status'].map(
              (head) => (
                <TableHead key={head} className="whitespace-nowrap">
                  {head}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.id}>
              <TableCell className="whitespace-nowrap font-medium">{run.id}</TableCell>
              <TableCell className="whitespace-nowrap">{run.model}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">12,004</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">6,200</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">$0.14</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">{run.latency}</TableCell>
              <TableCell className="whitespace-nowrap">{run.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const EmptyRows: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Run</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            No runs yet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
