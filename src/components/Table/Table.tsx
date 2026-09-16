import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Unstyled-by-default table shell on the design tokens. The scroll container is
 * part of `Table`, so a wide table never pushes the page sideways.
 *
 * Reach for `DataTable` instead when the rows come from an array and you want
 * sorting or paging without wiring it yourself.
 */
export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Lands on the scroll container that wraps the table, not the table itself. */
  containerClassName?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn('relative w-full overflow-x-auto', containerClassName)}>
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
)
TableBody.displayName = 'TableBody'

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

/** Totals row: sits on `muted` and stays bold without extra classes. */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = 'TableHead'

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
