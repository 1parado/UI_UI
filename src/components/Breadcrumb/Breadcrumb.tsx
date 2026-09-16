import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, MoreHorizontalIcon } from '@/lib/icons'

/**
 * Path to the current page. Renders a `<nav>` landmark with an ordered list —
 * put the trail behind the page title, and keep the last item plain text.
 */
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'>
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = 'Breadcrumb'

export type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className
      )}
      {...props}
    />
  )
)
BreadcrumbList.displayName = 'BreadcrumbList'

export type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

export type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'a'> & {
  /** Render the child element instead — use it to wrap a router `Link`. */
  asChild?: boolean
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        className={cn(
          'rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

export type BreadcrumbPageProps = React.ComponentPropsWithoutRef<'span'>

/** The current page. Not a link — marked `aria-current="page"`. */
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

export type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRightIcon />}
  </li>
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export type BreadcrumbEllipsisProps = React.ComponentPropsWithoutRef<'span'>

/** Collapsed middle of a deep trail. Pair with `title` for the hidden path. */
const BreadcrumbEllipsis = ({
  className,
  ...props
}: BreadcrumbEllipsisProps) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
