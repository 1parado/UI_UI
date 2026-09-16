import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  getPaginationRange,
} from '@/components/Pagination'
import { ChevronDownIcon, ChevronUpIcon } from '@/lib/icons'

export type SortDirection = 'asc' | 'desc'

export interface DataTableColumn<T> {
  /** Property to read from the row, or any stable id when `cell` renders it. */
  key: string
  header: React.ReactNode
  /** Renders the cell. Defaults to `row[key]`. */
  cell?: (row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  /** Enables the sort control on this column's header. */
  sortable?: boolean
  /**
   * Value the sort compares. Defaults to `row[key]` — set it when `cell`
   * renders something decorative (a badge, a formatted date).
   */
  sortValue?: (row: T) => string | number | Date | null | undefined
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Stable identity for React and for row keys. Defaults to the index. */
  getRowId?: (row: T, index: number) => string
  caption?: React.ReactNode
  emptyMessage?: React.ReactNode
  /** Rows per page. Omit to render everything without a pager. */
  pageSize?: number
  /** Column key to sort by before the user touches a header. */
  initialSort?: { key: string; direction: SortDirection }
  className?: string
  containerClassName?: string
}

/** Numbers compare numerically, dates chronologically, everything else as text. */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function alignClass(align: DataTableColumn<unknown>['align']): string {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

/**
 * Table driven by a column list: sorting and paging are handled for you, the
 * markup stays the `Table` primitives so you can restyle anything.
 *
 * ```tsx
 * <DataTable
 *   pageSize={10}
 *   columns={[
 *     { key: 'id', header: 'Run' },
 *     { key: 'tokens', header: 'Tokens', align: 'right', sortable: true },
 *   ]}
 *   data={runs}
 * />
 * ```
 */
function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  caption,
  emptyMessage = 'No results.',
  pageSize,
  initialSort,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{
    key: string
    direction: SortDirection
  } | null>(initialSort ?? null)
  const [page, setPage] = React.useState(1)

  const sorted = React.useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return data

    const read = (row: T) =>
      column.sortValue
        ? column.sortValue(row)
        : (row[column.key] as string | number | Date | null | undefined)

    // Copy first: callers own the array they passed in.
    const next = [...data].sort((a, b) => compareValues(read(a), read(b)))
    return sort.direction === 'asc' ? next : next.reverse()
  }, [columns, data, sort])

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const currentPage = Math.min(page, pageCount)

  const visible = React.useMemo(() => {
    if (!pageSize) return sorted
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [currentPage, pageSize, sorted])

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )

  const cellValue = (column: DataTableColumn<T>, row: T) => {
    if (column.cell) return column.cell(row)
    const value = row[column.key]
    if (value == null || value === '') return null
    if (value instanceof Date) return value.toLocaleDateString()
    return value as React.ReactNode
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Table containerClassName={containerClassName}>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const isSorted = sort?.key === column.key
              const ariaSort = !column.sortable
                ? undefined
                : isSorted
                  ? sort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'

              return (
                <TableHead
                  key={column.key}
                  aria-sort={ariaSort}
                  className={cn(
                    alignClass(column.align),
                    column.headerClassName
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm uppercase tracking-wide transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        column.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      {column.header}
                      {isSorted ? (
                        sort.direction === 'asc' ? (
                          <ChevronUpIcon className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronUpIcon className="h-3.5 w-3.5 opacity-30" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            visible.map((row, index) => (
              <TableRow key={getRowId ? getRowId(row, index) : index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(alignClass(column.align), column.className)}
                  >
                    {cellValue(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageSize && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  asChild
                  aria-label="Go to previous page"
                  size="default"
                  className={cn(
                    'gap-1 pl-2.5',
                    currentPage === 1 && 'pointer-events-none opacity-50'
                  )}
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </PaginationLink>
              </PaginationItem>

              {getPaginationRange({ page: currentPage, pageCount }).map(
                (item, index) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink asChild isActive={item === currentPage}>
                        <button
                          type="button"
                          onClick={() => setPage(item)}
                          aria-label={`Go to page ${item}`}
                        >
                          {item}
                        </button>
                      </PaginationLink>
                    </PaginationItem>
                  )
              )}

              <PaginationItem>
                <PaginationLink
                  asChild
                  aria-label="Go to next page"
                  size="default"
                  className={cn(
                    'gap-1 pr-2.5',
                    currentPage === pageCount && 'pointer-events-none opacity-50'
                  )}
                >
                  <button
                    type="button"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

export { DataTable }
