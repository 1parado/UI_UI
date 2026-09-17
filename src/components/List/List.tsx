import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'

const listVariants = cva('w-full text-card-foreground', {
  variants: {
    variant: {
      bare: '',
      card: 'rounded-lg border border-border bg-card shadow-sm',
    },
    divided: {
      true: '[&>ul>li+li]:border-t [&>ul>li+li]:border-border',
      false: '',
    },
  },
  defaultVariants: { variant: 'bare', divided: false },
})

const listInnerVariants = cva('', {
  variants: {
    size: {
      // Rows are `<li>`s themselves, so padding lands on the row rather than
      // on a wrapper inside it.
      sm: '[&>li]:px-3 [&>li]:py-2',
      md: '[&>li]:px-4 [&>li]:py-3',
      lg: '[&>li]:px-5 [&>li]:py-4',
    },
  },
  defaultVariants: { size: 'md' },
})

interface ListBaseProps extends VariantProps<typeof listVariants> {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** How many skeleton rows while loading. Defaults to 3. */
  skeletonCount?: number
  /** Drawn when there is nothing to list. */
  empty?: React.ReactNode
  emptyText?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export interface ListProps<T>
  extends ListBaseProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Rows as data. Omit and pass children instead — either shape works, and
   * mixing them is not allowed so there is never a question of which wins.
   */
  items?: readonly T[]
  /** Stable identity for a row. Defaults to the index. */
  keyOf?: (item: T, index: number) => string | number
  renderItem?: (item: T, index: number) => React.ReactNode
  children?: React.ReactNode
}

type ListComponent = <T>(
  props: ListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

/**
 * A list with the boring parts already decided.
 *
 * Rows rarely need inventing; what gets rewritten in every screen is what goes
 * above them (a heading, a filter row), what goes below (a footer, a "load
 * more"), and what shows up when there is nothing to show. So this container
 * takes those three as slots, owns the divider lines, the padding and the
 * divided spacing, and renders either `items` or `children` — never both, so
 * there is no guessing which one won.
 *
 * Loading draws skeleton rows rather than nothing, because an list that shows
 * its empty state for half a second while fetching tells a lie.
 *
 * ```tsx
 * <List
 *   variant="card"
 *   divided
 *   header={<ListTitle>Team</ListTitle>}
 *   items={members}
 *   keyOf={(member) => member.id}
 *   renderItem={(member) => <ListItem>…</ListItem>}
 * />
 * ```
 */
const ListRoot = <T,>(
  {
    items,
    keyOf,
    renderItem,
    children,
    variant,
    divided,
    size,
    loading = false,
    skeletonCount = 3,
    empty,
    emptyText = 'Nothing here yet',
    header,
    footer,
    className,
    ...props
  }: ListProps<T>,
  ref: React.Ref<HTMLDivElement>
) => {
  const rows = React.Children.toArray(children)
  const fromData = Boolean(items?.length) && Boolean(renderItem)
  const nothingToShow = !loading && !fromData && rows.length === 0

  const body = loading ? (
    <>
      {Array.from({ length: skeletonCount }, (_, index) => (
        <li key={index}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </li>
      ))}
    </>
  ) : (
    <>
      {fromData
        ? items?.map((item, index) => (
            // Fragment, not a wrapper element: `ListItem` already is the row,
            // and wrapping it in another `<li>` would nest two rows.
            <React.Fragment key={keyOf?.(item, index) ?? index}>
              {renderItem?.(item, index)}
            </React.Fragment>
          ))
        : rows.map((row, index) => <React.Fragment key={index}>{row}</React.Fragment>)}
    </>
  )

  return (
    <div ref={ref} className={cn(listVariants({ variant, divided }), className)} {...props}>
      {header && <div className="border-b border-border px-4 py-3">{header}</div>}

      {nothingToShow ? (
        <div className="px-4 py-10 text-center">
          {empty ?? <p className="text-sm text-muted-foreground">{emptyText}</p>}
        </div>
      ) : (
        <ul className={cn(listInnerVariants({ size }))}>{body}</ul>
      )}

      {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
    </div>
  )
}

export const List = React.forwardRef(ListRoot) as ListComponent

export type ListItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
  /** Row reacts to hover and shows a pointer. */
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
}

/**
 * One row, and it *is* the `<li>`.
 *
 * `List` hands rows straight to its `<ul>` rather than wrapping each in
 * another element, so the padding that lines up with the dividers belongs to
 * the row itself. Its children are usually `ListItemContent` /
 * `ListItemActions`, but anything goes.
 */
const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ interactive = false, selected = false, disabled = false, className, ...props }, ref) => (
    <li
      ref={ref}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        'flex w-full items-center gap-3 text-sm',
        interactive && !disabled && 'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground',
        selected && 'bg-accent/60',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  )
)
ListItem.displayName = 'ListItem'

export type ListSectionProps = React.HTMLAttributes<HTMLDivElement>

const ListHeader = React.forwardRef<HTMLDivElement, ListSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-3', className)}
      {...props}
    />
  )
)
ListHeader.displayName = 'ListHeader'

export type ListTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const ListTitle = React.forwardRef<HTMLHeadingElement, ListTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-sm font-semibold tracking-tight', className)} {...props} />
  )
)
ListTitle.displayName = 'ListTitle'

export type ListDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const ListDescription = React.forwardRef<HTMLParagraphElement, ListDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props} />
  )
)
ListDescription.displayName = 'ListDescription'

/** Anything on the row that is not its title: a value, a badge, a menu. */
const ListItemActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('ml-auto flex shrink-0 items-center gap-2', className)}
    {...props}
  />
))
ListItemActions.displayName = 'ListItemActions'

/** The row's body: title plus whatever explains it. */
const ListItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('min-w-0 flex-1', className)} {...props} />
))
ListItemContent.displayName = 'ListItemContent'

export {
  ListItem,
  ListHeader,
  ListTitle,
  ListDescription,
  ListItemActions,
  ListItemContent,
  listVariants,
}
