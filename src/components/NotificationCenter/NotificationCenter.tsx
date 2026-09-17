import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { ScrollArea } from '@/components/ScrollArea'
import { BellIcon, CheckCheckIcon, InboxIcon, XIcon } from '@/lib/icons'

const toneVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4',
  {
    variants: {
      tone: {
        default: 'bg-muted text-muted-foreground',
        info: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  }
)

const headingClassName =
  'bg-card px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'

/**
 * An item is unread unless the list has been told otherwise. Shared so the
 * bell's badge and the panel's headings can never disagree about the count.
 */
const isItemRead = (item: NotificationItem, overrides: Record<string, boolean>) =>
  overrides[item.id] ?? item.read ?? false

export interface NotificationItem {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Usually a relative time — "2 minutes ago". */
  timestamp?: React.ReactNode
  /** Starting read state. The list tracks reads itself from there. */
  read?: boolean
  /** Leading icon. Without one the row shows a tone-tinted dot instead. */
  icon?: React.ReactNode
  /** Colour of the leading badge. */
  tone?: VariantProps<typeof toneVariants>['tone']
  /** Turns the heading into a link rather than a button. */
  href?: string
  /** Extra controls for this row — a menu, a copy button. */
  action?: React.ReactNode
}

export interface NotificationListLabels {
  /** Heading over the unread rows. */
  unread?: string
  /** Heading over the read rows. */
  earlier?: string
  /** Label on the bulk action. */
  markAllRead?: string
  /** Announced for the dismiss control on each row. */
  dismiss?: string
}

export interface NotificationListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  notifications: NotificationItem[]
  /** Panel heading. Omit it for an embedded list with no chrome. */
  title?: React.ReactNode
  onItemSelect?: (item: NotificationItem) => void
  onItemDismiss?: (item: NotificationItem) => void
  /**
   * Called when the bulk action is used. The list has already updated its own
   * read state by then — this is the hook for persisting it.
   */
  onMarkAllRead?: () => void
  emptyMessage?: React.ReactNode
  /** Split rows under "New" and "Earlier" headings. Defaults to `true`. */
  groupUnread?: boolean
  /** Show the built-in dismiss control on every row. */
  dismissible?: boolean
  /** Cap on the scroll area, in pixels unless given a CSS length. */
  maxHeight?: number | string
  labels?: NotificationListLabels
  /**
   * Read state keyed by id, layered over `NotificationItem.read`. Omit it and
   * the list keeps its own — `NotificationCenter` passes it in so the bell's
   * badge stays in step with the rows it opens.
   */
  readOverrides?: Record<string, boolean>
  onReadOverridesChange?: (next: Record<string, boolean>) => void
}

/**
 * The inbox itself, with no popover around it — use it directly on a
 * notifications page.
 *
 * Read state is layered on top of the items rather than lifted into props, so
 * the list is useful with no wiring at all; a parent that wants to persist
 * reads gets the same events through the callbacks.
 */
const NotificationList = React.forwardRef<HTMLDivElement, NotificationListProps>(
  (
    {
      className,
      notifications,
      title,
      onItemSelect,
      onItemDismiss,
      onMarkAllRead,
      emptyMessage = 'You are all caught up.',
      groupUnread = true,
      dismissible = false,
      maxHeight = 360,
      labels,
      readOverrides,
      onReadOverridesChange,
      ...props
    },
    ref
  ) => {
    const {
      unread: unreadLabel = 'New',
      earlier: earlierLabel = 'Earlier',
      markAllRead: markAllReadLabel = 'Mark all read',
      dismiss: dismissLabel = 'Dismiss',
    } = labels ?? {}

    const [ownOverrides, setOwnOverrides] = React.useState<Record<string, boolean>>({})
    const [dismissed, setDismissed] = React.useState<Record<string, boolean>>({})

    // Controlled by `NotificationCenter` when the badge has to agree with the
    // rows; self-managed when the list is used on its own.
    const overrides = readOverrides ?? ownOverrides
    const writeOverrides = (
      update: (current: Record<string, boolean>) => Record<string, boolean>
    ) => {
      const next = update(overrides)
      if (readOverrides === undefined) setOwnOverrides(next)
      onReadOverridesChange?.(next)
    }

    const visible = notifications.filter((item) => !dismissed[item.id])
    const unread = visible.filter((item) => !isItemRead(item, overrides))
    const read = visible.filter((item) => isItemRead(item, overrides))
    const unreadCount = unread.length

    const markAllRead = () => {
      writeOverrides((current) => {
        const next = { ...current }
        for (const item of notifications) next[item.id] = true
        return next
      })
      onMarkAllRead?.()
    }

    const handleSelect = (item: NotificationItem) => {
      writeOverrides((current) => ({ ...current, [item.id]: true }))
      onItemSelect?.(item)
    }

    const handleDismiss = (item: NotificationItem) => {
      setDismissed((current) => ({ ...current, [item.id]: true }))
      onItemDismiss?.(item)
    }

    const renderRow = (item: NotificationItem) => {
      const rowRead = isItemRead(item, overrides)
      const interactive = Boolean(item.href || onItemSelect)
      const Heading = item.href ? 'a' : 'button'
      const dismissName =
        typeof item.title === 'string' ? `${dismissLabel}: ${item.title}` : dismissLabel

      return (
        <li
          key={item.id}
          data-read={rowRead || undefined}
          className={cn(
            'relative flex items-start gap-3 px-3 py-2.5 transition-colors',
            // Unread rows carry a tint, so the split reads at a glance without
            // the headings having to do all the work.
            !rowRead && 'bg-accent/40',
            interactive && 'hover:bg-accent'
          )}
        >
          <span className={cn(toneVariants({ tone: item.tone }))} aria-hidden="true">
            {item.icon ?? <span className="h-2 w-2 rounded-full bg-current" />}
          </span>

          <div className="min-w-0 flex-1">
            {interactive ? (
              // The heading is the interactive element rather than the whole
              // row. A row-wide overlay would either swallow clicks meant for
              // the trailing controls or need a pointer-events dance that
              // breaks text selection for no real gain.
              <Heading
                {...(item.href
                  ? { href: item.href }
                  : { type: 'button' as const, onClick: () => handleSelect(item) })}
                className={cn(
                  'block w-full text-left text-sm font-medium hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  rowRead ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {item.title}
              </Heading>
            ) : (
              <p
                className={cn(
                  'text-sm font-medium',
                  rowRead ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {item.title}
              </p>
            )}

            {item.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            )}

            {item.timestamp && (
              <p className="mt-1 text-xs text-muted-foreground">{item.timestamp}</p>
            )}
          </div>

          {/* After the heading in the DOM, so it wins the click — and outside
              it, so the markup stays free of nested controls. */}
          {(item.action || dismissible) && (
            <div className="flex shrink-0 items-center gap-1">
              {item.action}
              {dismissible && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={dismissName}
                  onClick={() => handleDismiss(item)}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <XIcon aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </li>
      )
    }

    const split = groupUnread && unread.length > 0 && read.length > 0

    return (
      <div ref={ref} className={cn('text-card-foreground', className)} {...props}>
        {title && (
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <p className="text-sm font-semibold">{title}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0}
              onClick={markAllRead}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {markAllReadLabel}
            </Button>
          </div>
        )}

        <ScrollArea type="auto" style={{ maxHeight }}>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <InboxIcon aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : split ? (
            <>
              <p className={headingClassName}>{unreadLabel}</p>
              <ul className="list-none divide-y divide-border">{unread.map(renderRow)}</ul>
              <p className={headingClassName}>{earlierLabel}</p>
              <ul className="list-none divide-y divide-border">{read.map(renderRow)}</ul>
            </>
          ) : (
            <ul className="list-none divide-y divide-border">{visible.map(renderRow)}</ul>
          )}
        </ScrollArea>
      </div>
    )
  }
)
NotificationList.displayName = 'NotificationList'

export interface NotificationCenterProps
  // The popover owns read state so the badge and the panel agree; exposing the
  // override map here would let a caller desynchronise the two.
  extends Omit<NotificationListProps, 'readOverrides' | 'onReadOverridesChange'> {
  /** Controlled open state for the popover. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'start' | 'center' | 'end'
  /** Rendered under the list, e.g. a link through to the full inbox. */
  footer?: React.ReactNode
  /** Replace the built-in bell. */
  children?: React.ReactNode
  /** Accessible name for the built-in bell. */
  triggerLabel?: string
  /** Cap on the count shown on the bell; above it renders `N+`. */
  maxBadge?: number
}

/**
 * A bell with an unread count that opens an inbox panel. Everything the panel
 * shows comes from `NotificationList`, so the same data can back both this and
 * a full-page inbox.
 *
 * ```tsx
 * <NotificationCenter
 *   notifications={[
 *     { id: '1', title: 'Deploy finished', timestamp: '2m ago', tone: 'success' },
 *     { id: '2', title: 'Build failed', description: 'web · exit 1', timestamp: '1h ago', read: true },
 *   ]}
 * />
 * ```
 */
const NotificationCenter = React.forwardRef<HTMLButtonElement, NotificationCenterProps>(
  (
    {
      notifications,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      title = 'Notifications',
      align = 'end',
      footer,
      children,
      triggerLabel = 'Notifications',
      maxBadge = 9,
      ...listProps
    },
    ref
  ) => {
    const [openState, setOpenState] = React.useState(defaultOpen)
    const open = openProp ?? openState

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
    }

    // Held here rather than in the list so the badge counts the same rows the
    // panel is about to show — reading one from the panel drops the number by
    // one immediately, which is the whole point of the badge.
    const [readOverrides, setReadOverrides] = React.useState<Record<string, boolean>>({})

    const unreadCount = notifications.filter((item) => !isItemRead(item, readOverrides)).length
    const badgeText = unreadCount > maxBadge ? `${maxBadge}+` : String(unreadCount)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children ?? (
            <button
              ref={ref}
              type="button"
              aria-label={triggerLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                'relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <BellIcon aria-hidden="true" className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full border-0 px-1 text-[10px] leading-none"
                >
                  {badgeText}
                </Badge>
              )}
            </button>
          )}
        </PopoverTrigger>

        <PopoverContent align={align} className="w-80 p-0" aria-label={triggerLabel}>
          <NotificationList
            notifications={notifications}
            title={title}
            className="p-0"
            readOverrides={readOverrides}
            onReadOverridesChange={setReadOverrides}
            {...listProps}
          />
          {footer && <div className="border-t border-border px-3 py-2 text-sm">{footer}</div>}
        </PopoverContent>
      </Popover>
    )
  }
)
NotificationCenter.displayName = 'NotificationCenter'

export { NotificationCenter, NotificationList, toneVariants as notificationToneVariants }
