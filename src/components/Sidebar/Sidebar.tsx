import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Input } from '@/components/Input'
import { Separator } from '@/components/Separator'
import { Sheet, SheetContent } from '@/components/Sheet'
import { Skeleton } from '@/components/Skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip'
import { PanelLeftIcon } from '@/lib/icons'

/**
 * Application sidebar: a persistent rail next to the main content that can
 * collapse to icons, or slide away entirely, and becomes an overlay sheet on
 * narrow viewports.
 *
 * Layout dimensions live in CSS variables on the provider (`--sidebar-width`,
 * `--sidebar-width-icon`, `--sidebar-width-mobile`) rather than in theme
 * tokens, because they describe geometry rather than colour — the same split
 * shadcn uses. Colours stay on existing tokens: the rail paints `bg-muted/40`
 * so it reads as chrome without inventing a parallel palette.
 *
 * Direction of collapse is opt-in per instance: `collapsible="icon"` keeps the
 * rail and hides labels (pairing each button with a `tooltip`), `"offcanvas"`
 * slides it out of the flow, and `"none"` is a fixed rail that never moves.
 */

const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const MOBILE_BREAKPOINT = 768

type SidebarContextValue = {
  /** Which shape the rail is currently in. */
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  /** Overlay state, used instead of `open` below the breakpoint. */
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

/**
 * Read the rail's state from anywhere inside it. Use it to react to collapse —
 * swapping a logo for a mark, hiding a label — or to drive your own toggle.
 *
 * ```tsx
 * const { state, toggleSidebar, isMobile } = useSidebar()
 * ```
 */
function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => setIsMobile(query.matches)
    update()

    // Safari below 14 only has the deprecated pair.
    if (query.addEventListener) {
      query.addEventListener('change', update)
      return () => query.removeEventListener('change', update)
    }
    query.addListener(update)
    return () => query.removeListener(update)
  }, [])

  return isMobile
}

function readStoredOpen(storageKey: string | undefined): boolean | undefined {
  if (!storageKey || typeof window === 'undefined') return undefined
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored === null ? undefined : stored === 'true'
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Staying
    // unpersisted beats throwing on first render.
    return undefined
  }
}

export type SidebarProviderProps = React.ComponentProps<'div'> & {
  /** Uncontrolled starting state. Ignored when `open` is supplied. */
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Persist the last state under this key, so a reload keeps the rail as the user left it. */
  storageKey?: string
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      storageKey,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
      () => readStoredOpen(storageKey) ?? defaultOpen
    )

    const open = openProp ?? uncontrolledOpen

    // The keyboard handler and `toggleSidebar` are stable callbacks, so they
    // read the current value through a ref instead of closing over it.
    const openRef = React.useRef(open)
    const onOpenChangeRef = React.useRef(onOpenChange)
    React.useEffect(() => {
      openRef.current = open
      onOpenChangeRef.current = onOpenChange
    }, [open, onOpenChange])

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (openProp === undefined) setUncontrolledOpen(next)
        onOpenChangeRef.current?.(next)
      },
      [openProp]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((previous) => !previous) : setOpen(!openRef.current)
    }, [isMobile, setOpen])

    React.useEffect(() => {
      if (!storageKey || typeof window === 'undefined') return
      try {
        window.localStorage.setItem(storageKey, String(open))
      } catch {
        // Ignored: persistence is a convenience, not a contract.
      }
    }, [storageKey, open])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebar])

    const context = React.useMemo<SidebarContextValue>(
      () => ({
        state: open ? 'expanded' : 'collapsed',
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [open, setOpen, openMobile, isMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={context}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            data-sidebar="sidebar-wrapper"
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-muted/40',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = 'SidebarProvider'

export type SidebarProps = React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === 'none') {
      return (
        <div
          ref={ref}
          data-sidebar="sidebar-root"
          data-state={state}
          data-variant={variant}
          data-side={side}
          data-collapsible="none"
          className={cn(
            'flex h-full w-[var(--sidebar-width)] flex-col bg-muted/40 text-foreground',
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            ref={ref}
            data-sidebar="sidebar-root"
            data-state={state}
            data-mobile="true"
            data-side={side}
            side={side}
            hideClose
            className={cn('w-[var(--sidebar-width)] bg-muted/40 p-0 text-foreground', className)}
          >
            <div data-sidebar="sidebar" className="flex h-full w-full flex-col">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        data-sidebar="sidebar-root"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
        className="group peer hidden text-foreground md:block"
        {...props}
      >
        {/* Reserves (or releases) the rail's width in the layout flow, so the
            content beside it reflows instead of being covered. */}
        <div
          className={cn(
            'relative h-svh w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
            'group-data-[collapsible=offcanvas]:w-0',
            'group-data-[side=right]:rotate-180',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
              : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]'
          )}
        />
        <div
          className={cn(
            'fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
            side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
              : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className={cn(
              'flex h-full w-full flex-col bg-muted/40',
              variant === 'floating' && 'rounded-lg border shadow-sm'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = 'Sidebar'

export type SidebarTriggerProps = React.ComponentProps<'button'>

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        data-sidebar="trigger"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <PanelLeftIcon className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </button>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

/** A hairline strip on the rail's outer edge that toggles it, like a resize handle. */
const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        data-sidebar="rail"
        aria-label="Toggle sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle sidebar"
        className={cn(
          'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
          'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-muted/40',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarRail.displayName = 'SidebarRail'

/** The content column that sits beside the rail. */
const SidebarInset = React.forwardRef<HTMLElement, React.ComponentProps<'main'>>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      data-sidebar="inset"
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  )
)
SidebarInset.displayName = 'SidebarInset'

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    data-sidebar="input"
    className={cn('h-8 w-full bg-background shadow-none focus-visible:ring-2', className)}
    {...props}
  />
))
SidebarInput.displayName = 'SidebarInput'

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
)
SidebarHeader.displayName = 'SidebarHeader'

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = 'SidebarFooter'

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    data-sidebar="separator"
    className={cn('mx-2 w-auto bg-border', className)}
    {...props}
  />
))
SidebarSeparator.displayName = 'SidebarSeparator'

/** Scrollable middle of the rail — header and footer stay put. */
const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  )
)
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  )
)
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-ring [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  )
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-sidebar="group-action"
      className={cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
)
SidebarGroupAction.displayName = 'SidebarGroupAction'

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
  )
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
)
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  )
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-foreground outline-none transition-[width,height,padding] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground data-[state=open]:hover:bg-accent [&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!p-2',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'bg-background shadow-[0_0_0_1px_hsl(var(--border))] hover:bg-accent',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type SidebarMenuButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean
    isActive?: boolean
    /** Shown on hover when the rail is collapsed to icons. */
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'default',
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const { isMobile, state } = useSidebar()
    const Component = asChild ? Slot : 'button'

    const button = (
      <Component
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        // A rail button inside a form must not submit it; with `asChild` the
        // child owns its own element type.
        {...(asChild ? {} : { type: 'button' as const })}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) return button

    const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          // Only useful while the label is hidden.
          hidden={state !== 'collapsed' || isMobile}
          {...tooltipProps}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean; showOnHover?: boolean }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring peer-hover/menu-button:text-accent-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-accent-foreground md:opacity-0',
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-foreground',
        'peer-hover/menu-button:text-accent-foreground peer-data-[active=true]/menu-button:text-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
)
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { showIcon?: boolean }
>(({ className, showIcon = false, ...props }, ref) => {
  // Deterministic-but-varied width so a list of skeletons does not look printed.
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && <Skeleton className="h-4 w-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-[var(--skeleton-width)] flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ '--skeleton-width': width } as React.CSSProperties}
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-border px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  )
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  (props, ref) => <li ref={ref} {...props} />
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

export type SidebarMenuSubButtonProps = React.ComponentProps<'a'> & {
  asChild?: boolean
  size?: 'sm' | 'md'
  isActive?: boolean
}

const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  ({ asChild = false, size = 'md', isActive = false, className, ...props }, ref) => {
    const Component = asChild ? Slot : 'a'

    return (
      <Component
        ref={ref}
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
          'group-data-[collapsible=icon]:hidden',
          isActive && 'bg-accent text-accent-foreground',
          size === 'sm' && 'text-xs',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  useSidebar,
}

export type { SidebarContextValue }
