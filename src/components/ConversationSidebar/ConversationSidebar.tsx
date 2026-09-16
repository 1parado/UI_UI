import * as React from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ScrollArea'
import { Input } from '../Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu'
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from '@/lib/icons'

export type ConversationSidebarProps = React.HTMLAttributes<HTMLElement>

/** History rail. Needs a bounded height for the inner scroll area. */
const ConversationSidebar = React.forwardRef<
  HTMLElement,
  ConversationSidebarProps
>(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      'flex w-64 shrink-0 flex-col gap-2 border-r border-border bg-background p-2',
      className
    )}
    {...props}
  />
))
ConversationSidebar.displayName = 'ConversationSidebar'

export type ConversationSidebarHeaderProps = React.HTMLAttributes<HTMLDivElement>

/** Top slot — usually the "new chat" action. */
const ConversationSidebarHeader = React.forwardRef<
  HTMLDivElement,
  ConversationSidebarHeaderProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-1 px-1', className)}
    {...props}
  />
))
ConversationSidebarHeader.displayName = 'ConversationSidebarHeader'

export type ConversationSidebarContentProps = React.HTMLAttributes<HTMLDivElement>

/** Scrolling list of `ConversationSidebarGroup`s. */
const ConversationSidebarContent = React.forwardRef<
  HTMLDivElement,
  ConversationSidebarContentProps
>(({ className, children, ...props }, ref) => (
  <ScrollArea className={cn('min-h-0 flex-1', className)}>
    <div ref={ref} className="flex flex-col gap-4 p-1" {...props}>
      {children}
    </div>
  </ScrollArea>
))
ConversationSidebarContent.displayName = 'ConversationSidebarContent'

export type ConversationSidebarFooterProps = React.HTMLAttributes<HTMLDivElement>

/** Bottom slot — account, settings, usage. */
const ConversationSidebarFooter = React.forwardRef<
  HTMLDivElement,
  ConversationSidebarFooterProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-auto flex items-center gap-1 border-t border-border px-1 pt-2', className)}
    {...props}
  />
))
ConversationSidebarFooter.displayName = 'ConversationSidebarFooter'

export interface ConversationSidebarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Group heading, e.g. "Today". */
  label: string
}

/** Time bucket ("Today", "Previous 7 days"). */
const ConversationSidebarGroup = React.forwardRef<
  HTMLDivElement,
  ConversationSidebarGroupProps
>(({ className, label, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-0.5', className)} {...props}>
    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
      {label}
    </div>
    {children}
  </div>
))
ConversationSidebarGroup.displayName = 'ConversationSidebarGroup'

export interface ConversationItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  title: string
  /** Currently open. */
  active?: boolean
  disabled?: boolean
  /** Persist a rename. The rename affordance is hidden when omitted. */
  onRename?: (title: string) => void
  /** Delete this conversation. The affordance is hidden when omitted. */
  onDelete?: () => void
  /** Selection handler — the menu trigger does not bubble into it. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** One conversation row with inline rename and a delete menu. */
const ConversationItem = React.forwardRef<
  HTMLDivElement,
  ConversationItemProps
>(
  (
    {
      className,
      title,
      active = false,
      disabled = false,
      onRename,
      onDelete,
      onClick,
      ...props
    },
    ref
  ) => {
    const [renaming, setRenaming] = React.useState(false)
    const [draft, setDraft] = React.useState(title)

    React.useEffect(() => {
      setDraft(title)
    }, [title])

    const commitRename = () => {
      const next = draft.trim()
      setRenaming(false)
      if (next && next !== title) onRename?.(next)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'group/item flex items-center gap-1 rounded-md px-1',
          active && 'bg-accent',
          className
        )}
        {...props}
      >
        {renaming ? (
          <Input
            autoFocus
            aria-label="Conversation title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitRename()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                setDraft(title)
                setRenaming(false)
              }
            }}
            className="h-8 flex-1"
          />
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-current={active ? 'true' : undefined}
            className="flex min-w-0 flex-1 items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="truncate">{title}</span>
          </button>
        )}

        {!renaming && (onRename || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${title}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/item:opacity-100 motion-reduce:transition-none"
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem
                  onSelect={() => {
                    setDraft(title)
                    setRenaming(true)
                  }}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onSelect={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }
)
ConversationItem.displayName = 'ConversationItem'

export {
  ConversationSidebar,
  ConversationSidebarHeader,
  ConversationSidebarContent,
  ConversationSidebarFooter,
  ConversationSidebarGroup,
  ConversationItem,
}
