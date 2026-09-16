import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/Button'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from '@/lib/icons'

export type PaginationRangeItem = number | 'ellipsis'

export interface GetPaginationRangeOptions {
  /** Current page, 1-based. Clamped into `[1, pageCount]`. */
  page: number
  pageCount: number
  /** Pages shown either side of the current one. Defaults to 1. */
  siblingCount?: number
  /** Pages always shown at each end. Defaults to 1. */
  boundaryCount?: number
}

/**
 * Builds the page list for a pagination bar, collapsing the middle into
 * `'ellipsis'` when the range would be too wide. Pure — so callers can render
 * it however they like, or not use it at all and pass items by hand.
 *
 * `getPaginationRange({ page: 10, pageCount: 20 })`
 * → `[1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]`
 */
export function getPaginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: GetPaginationRangeOptions): PaginationRangeItem[] {
  if (!Number.isFinite(pageCount) || pageCount <= 0) return []

  const current = Math.min(Math.max(Math.trunc(page) || 1, 1), pageCount)
  const boundaries = Math.max(0, Math.trunc(boundaryCount))
  const siblings = Math.max(0, Math.trunc(siblingCount))

  const range = (start: number, end: number) =>
    start > end ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i)

  /** first + last + current + one slot per ellipsis */
  const width = boundaries * 2 + siblings * 2 + 3
  if (pageCount <= width) return range(1, pageCount)

  const leftSibling = Math.max(current - siblings, boundaries + 2)
  const rightSibling = Math.min(
    current + siblings,
    pageCount - boundaries - 1
  )

  const items: PaginationRangeItem[] = range(1, boundaries)

  if (leftSibling > boundaries + 2) {
    items.push('ellipsis')
  } else {
    items.push(...range(boundaries + 1, leftSibling - 1))
  }

  items.push(...range(leftSibling, rightSibling))

  if (rightSibling < pageCount - boundaries - 1) {
    items.push('ellipsis')
  } else {
    items.push(...range(rightSibling + 1, pageCount - boundaries))
  }

  items.push(...range(pageCount - boundaries + 1, pageCount))

  return items
}

/** Landmark wrapper. Everything inside is a plain list of links or buttons. */
export type PaginationProps = React.ComponentPropsWithoutRef<'nav'>

const Pagination = ({ className, ...props }: PaginationProps) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

export type PaginationContentProps = React.ComponentPropsWithoutRef<'ul'>

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  PaginationContentProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row flex-wrap items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

export type PaginationItemProps = React.ComponentPropsWithoutRef<'li'>

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
PaginationItem.displayName = 'PaginationItem'

export interface PaginationLinkProps
  extends React.ComponentPropsWithoutRef<'a'> {
  /** Marks the page the user is currently on. */
  isActive?: boolean
  /** Render the child element instead — wrap a router `Link`. */
  asChild?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const PaginationLink = ({
  className,
  isActive,
  asChild = false,
  size = 'icon',
  ...props
}: PaginationLinkProps) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className
      )}
      {...props}
    />
  )
}
PaginationLink.displayName = 'PaginationLink'

export type PaginationPreviousProps = PaginationLinkProps & {
  /** Override the visible label. Defaults to `Previous`. */
  text?: string
}

const PaginationPrevious = ({
  className,
  text = 'Previous',
  ...props
}: PaginationPreviousProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
    <span>{text}</span>
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

export type PaginationNextProps = PaginationLinkProps & {
  /** Override the visible label. Defaults to `Next`. */
  text?: string
}

const PaginationNext = ({
  className,
  text = 'Next',
  ...props
}: PaginationNextProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>{text}</span>
    <ChevronRightIcon className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

export type PaginationEllipsisProps = React.ComponentPropsWithoutRef<'span'> & {
  /** Explain what is hidden, e.g. "Pages 4 to 9". */
  label?: string
}

const PaginationEllipsis = ({
  className,
  label = 'More pages',
  ...props
}: PaginationEllipsisProps) => (
  <span
    aria-hidden="true"
    className={cn('flex h-10 w-10 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">{label}</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
