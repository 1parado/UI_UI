import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const itemGroupVariants = cva('flex w-full flex-col', {
  variants: {
    /** `default` draws a hairline between items; `plain` leaves spacing only. */
    variant: {
      default: 'gap-0 divide-y divide-border',
      plain: 'gap-1',
      grid: 'grid gap-2 sm:grid-cols-2',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface ItemGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemGroupVariants> {}

/** Wrapper that owns the rhythm between `Item`s. Not a `<ul>` — items are not always a list. */
const ItemGroup = React.forwardRef<HTMLDivElement, ItemGroupProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(itemGroupVariants({ variant }), className)} {...props} />
  )
)
ItemGroup.displayName = 'ItemGroup'

const itemVariants = cva(
  'group/item flex items-center gap-3 text-sm transition-colors [&:has([data-slot=item-actions])]:pr-1.5',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'rounded-lg border border-border bg-card',
        muted: 'rounded-lg bg-muted/50',
      },
      size: {
        default: 'px-3 py-3',
        sm: 'px-2.5 py-2',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        false: '',
      },
      selected: {
        true: 'bg-accent',
        false: '',
      },
    },
    defaultVariants: { variant: 'default', size: 'default', interactive: false, selected: false },
  }
)

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  /**
   * Render as the child element instead of a `div` — pass an `<a>` or a
   * `<button>` and the item becomes one control rather than a div with a
   * nested button inside it (a nested button swallows the hit area and is
   * invalid HTML).
   */
  asChild?: boolean
}

/**
 * One row of a list: leading media, a title/description stack, and trailing
 * actions.
 *
 * The parts are slots, not props, so anything can go in them — an `Avatar`, a
 * `Switch`, a `Badge`, two `Button`s. `Item` only decides layout, and
 * `interactive` adds the hover/focus treatment when the row itself is the
 * control.
 *
 * ```tsx
 * <ItemGroup>
 *   <Item interactive asChild>
 *     <a href="/projects/atlas">
 *       <ItemMedia variant="icon"><FolderIcon /></ItemMedia>
 *       <ItemContent>
 *         <ItemTitle>Atlas</ItemTitle>
 *         <ItemDescription>Updated 2 hours ago</ItemDescription>
 *       </ItemContent>
 *       <ItemActions><ChevronRightIcon /></ItemActions>
 *     </a>
 *   </Item>
 * </ItemGroup>
 * ```
 */
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, size, interactive, selected, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'div'
    return (
      <Component
        ref={ref}
        data-slot="item"
        data-selected={selected || undefined}
        className={cn(itemVariants({ variant, size, interactive, selected }), className)}
        {...props}
      />
    )
  }
)
Item.displayName = 'Item'

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'icon' | 'image'
}

/** Leading slot. Fixed width, so titles line up down the column. */
const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-media"
      className={cn(
        'flex shrink-0 items-center justify-center',
        variant === 'icon' && 'size-9 rounded-md bg-muted text-muted-foreground [&_svg]:size-4',
        variant === 'image' && 'size-10 overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover',
        className
      )}
      {...props}
    />
  )
)
ItemMedia.displayName = 'ItemMedia'

export type ItemContentProps = React.HTMLAttributes<HTMLDivElement>

/** The flexible middle column. */
const ItemContent = React.forwardRef<HTMLDivElement, ItemContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  )
)
ItemContent.displayName = 'ItemContent'

export type ItemTitleProps = React.HTMLAttributes<HTMLDivElement>

const ItemTitle = React.forwardRef<HTMLDivElement, ItemTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-title"
      className={cn('truncate font-medium leading-none text-foreground', className)}
      {...props}
    />
  )
)
ItemTitle.displayName = 'ItemTitle'

export type ItemDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const ItemDescription = React.forwardRef<HTMLParagraphElement, ItemDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="item-description"
      className={cn('truncate text-xs leading-snug text-muted-foreground', className)}
      {...props}
    />
  )
)
ItemDescription.displayName = 'ItemDescription'

export type ItemActionsProps = React.HTMLAttributes<HTMLDivElement>

/** Trailing slot. Kept out of the row's text flow so it never truncates a title. */
const ItemActions = React.forwardRef<HTMLDivElement, ItemActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-actions"
      className={cn('flex shrink-0 items-center gap-1', className)}
      {...props}
    />
  )
)
ItemActions.displayName = 'ItemActions'

export type ItemHeaderProps = React.HTMLAttributes<HTMLDivElement>

/** Full-width row above the content, for a title that should not sit beside the media. */
const ItemHeader = React.forwardRef<HTMLDivElement, ItemHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('w-full px-3 pt-3', className)} {...props} />
  )
)
ItemHeader.displayName = 'ItemHeader'

export type ItemFooterProps = React.HTMLAttributes<HTMLDivElement>

const ItemFooter = React.forwardRef<HTMLDivElement, ItemFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('w-full px-3 pb-3', className)} {...props} />
  )
)
ItemFooter.displayName = 'ItemFooter'

export type ItemSeparatorProps = React.HTMLAttributes<HTMLDivElement>

const ItemSeparator = React.forwardRef<HTMLDivElement, ItemSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('h-px w-full bg-border', className)}
      {...props}
    />
  )
)
ItemSeparator.displayName = 'ItemSeparator'

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
}
