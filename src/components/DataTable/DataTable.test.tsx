import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row extends Record<string, unknown> {
  name: string
  score: number
}

const rows: Row[] = [
  { name: 'Ada', score: 91 },
  { name: 'Grace', score: 78 },
  { name: 'Alan', score: 84 },
]

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'score', header: 'Score', align: 'right', sortable: true },
]

const bodyRows = () =>
  screen
    .getAllByRole('row')
    .slice(1) // drop the header row
    .map((row) => within(row).getAllByRole('cell')[0].textContent)

describe('DataTable', () => {
  it('renders a header and one row per record', () => {
    render(<DataTable data={rows} columns={columns} />)

    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /score/i })).toBeInTheDocument()
    expect(bodyRows()).toEqual(['Ada', 'Grace', 'Alan'])
  })

  it('sorts ascending then descending when the header is activated', async () => {
    const user = userEvent.setup()
    render(<DataTable data={rows} columns={columns} />)

    await user.click(screen.getByRole('button', { name: /score/i }))
    expect(bodyRows()).toEqual(['Grace', 'Alan', 'Ada'])
    expect(screen.getByRole('columnheader', { name: /score/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )

    await user.click(screen.getByRole('button', { name: /score/i }))
    expect(bodyRows()).toEqual(['Ada', 'Alan', 'Grace'])
    expect(screen.getByRole('columnheader', { name: /score/i })).toHaveAttribute(
      'aria-sort',
      'descending'
    )
  })

  it('does not sort columns that are not marked sortable', () => {
    render(<DataTable data={rows} columns={columns} />)

    expect(screen.queryByRole('button', { name: /name/i })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /name/i })).not.toHaveAttribute('aria-sort')
  })

  it('leaves the caller’s array untouched', async () => {
    const user = userEvent.setup()
    const original = [...rows]
    render(<DataTable data={rows} columns={columns} />)

    await user.click(screen.getByRole('button', { name: /score/i }))

    expect(rows).toEqual(original)
  })

  it('pages through the data and reports the visible window', async () => {
    const user = userEvent.setup()
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Row ${i + 1}`,
      score: i,
    }))

    render(<DataTable data={many} columns={columns} pageSize={5} />)

    expect(bodyRows()).toEqual(['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5'])
    expect(screen.getByText('1–5 of 12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to next page' }))
    expect(bodyRows()).toEqual(['Row 6', 'Row 7', 'Row 8', 'Row 9', 'Row 10'])
    expect(screen.getByText('6–10 of 12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }))
    expect(bodyRows()).toEqual(['Row 11', 'Row 12'])
    expect(screen.getByText('11–12 of 12')).toBeInTheDocument()
  })

  it('renders no pager when everything fits on one page', () => {
    render(<DataTable data={rows} columns={columns} pageSize={10} />)

    expect(screen.queryByText(/of 3/)).not.toBeInTheDocument()
    expect(bodyRows()).toHaveLength(3)
  })

  it('shows the empty message spanning the table', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Nothing here." />)

    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })

  it('uses custom cells and their sort values', async () => {
    const user = userEvent.setup()
    const custom: DataTableColumn<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        cell: (row) => <span data-testid={`cell-${row.name}`}>{row.name.toUpperCase()}</span>,
        sortable: true,
        sortValue: (row) => row.name,
      },
    ]

    render(<DataTable data={rows} columns={custom} />)
    expect(screen.getByTestId('cell-Ada')).toHaveTextContent('ADA')

    await user.click(screen.getByRole('button', { name: /name/i }))
    expect(bodyRows()).toEqual(['ADA', 'ALAN', 'GRACE'])
  })
})
