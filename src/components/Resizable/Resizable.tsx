import * as React from 'react'
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type Layout,
  type LayoutChangedMeta,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'
import { ColumnsIcon } from '@/lib/icons'

type Orientation = 'horizontal' | 'vertical'

/**
 * The group's orientation, so a handle can draw itself along the right axis.
 * react-resizable-panels v4 sets the container's `flex-direction` itself and
 * does not publish the orientation as a DOM attribute, so the divider cannot
 * read it from the tree.
 */
const ResizableGroupContext = React.createContext<{ orientation: Orientation }>({
  orientation: 'horizontal',
})

export interface ResizablePanelGroupProps
  extends Omit<
    GroupProps,
    'children' | 'orientation' | 'defaultLayout' | 'onLayoutChanged' | 'elementRef'
  > {
  /** `direction` (the shadcn wording) or `orientation` — either works. */
  direction?: Orientation
  orientation?: Orientation
  /** Initial split, as `{ panelId: size }`. A saved layout wins over this. */
  defaultLayout?: Layout
  /** Fires after a drag ends — the right place to persist a layout. */
  onLayoutChanged?: (layout: Layout, meta: LayoutChangedMeta) => void
  /**
   * Persist the split in `localStorage` under this key, and restore it on the
   * next mount. Read synchronously so the first paint is already the saved
   * layout, rather than snapping into place after hydration.
   */
  storageKey?: string
  children?: React.ReactNode
}

/**
 * A split pane you can drag.
 *
 * This wraps **react-resizable-panels v4**, which is a different API from the
 * v2/v3 that most shadcn examples were written against:
 *
 * - the container takes `orientation` there, `direction` here (both work —
 *   `direction` is kept because it is what people type);
 * - **a numeric `defaultSize` is pixels, not percent** — write `"30"` or
 *   `"30%"` for a percentage. This is the one that silently does the wrong
 *   thing when copied from an older example;
 * - there is no `autoSaveId`; persistence is `storageKey` here, backed by
 *   `localStorage`, or `useDefaultLayout` from the package for custom storage.
 *
 * No `flex` classes are applied to the group on purpose: v4 sets
 * `display: flex` and `flex-direction` from `orientation` itself, and a
 * competing utility class would win over it. Everything else on `GroupProps` —
 * `id`, `groupRef`, `disableCursor`, `onLayoutChange` — passes straight
 * through.
 *
 * ```tsx
 * <ResizablePanelGroup direction="horizontal" storageKey="editor-split">
 *   <ResizablePanel defaultSize="30%" minSize="200px">…</ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel>…</ResizablePanel>
 * </ResizablePanelGroup>
 * ```
 */
const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  (
    {
      className,
      children,
      direction,
      orientation: orientationProp,
      defaultLayout,
      onLayoutChanged,
      storageKey,
      ...props
    },
    ref
  ) => {
    const orientation = orientationProp ?? direction ?? 'horizontal'

    const saved = React.useMemo(() => {
      if (!storageKey || typeof window === 'undefined') return undefined

      try {
        const raw = window.localStorage.getItem(storageKey)
        return raw ? (JSON.parse(raw) as Layout) : undefined
      } catch {
        // A corrupt or unreadable entry is not worth failing a render over.
        return undefined
      }
    }, [storageKey])

    const handleLayoutChanged = React.useCallback(
      (layout: Layout, meta: LayoutChangedMeta) => {
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(layout))
          } catch {
            // Private mode, quota — the split just does not persist.
          }
        }
        onLayoutChanged?.(layout, meta)
      },
      [storageKey, onLayoutChanged]
    )

    const value = React.useMemo(() => ({ orientation }), [orientation])

    return (
      <ResizableGroupContext.Provider value={value}>
        <Group
          orientation={orientation}
          // The stored split is the user's own doing, so it outranks the
          // layout the caller shipped as a default.
          defaultLayout={saved ?? defaultLayout}
          onLayoutChanged={handleLayoutChanged}
          className={cn('size-full', className)}
          {...props}
          elementRef={ref}
        >
          {children}
        </Group>
      </ResizableGroupContext.Provider>
    )
  }
)
ResizablePanelGroup.displayName = 'ResizablePanelGroup'

export type ResizablePanelProps = Omit<PanelProps, 'elementRef'>

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, ...props }, ref) => (
    <Panel
      // v4 takes the DOM node through `elementRef`; `ref` on the wrapper still
      // means "the element", which is what a caller expects.
      className={cn('overflow-auto', className)}
      {...props}
      elementRef={ref}
    />
  )
)
ResizablePanel.displayName = 'ResizablePanel'

export interface ResizableHandleProps extends Omit<SeparatorProps, 'elementRef'> {
  /** Draws the grip. The divider is draggable without it. */
  withHandle?: boolean
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, withHandle = false, children, ...props }, ref) => {
    const { orientation } = React.useContext(ResizableGroupContext)
    const vertical = orientation === 'vertical'

    return (
      <Separator
        className={cn(
          'group/handle relative flex items-center justify-center bg-border outline-none',
          // The line stays 1px; the hit area does not. `after:` widens the grab
          // region without moving anything on screen.
          vertical ? 'h-px w-full' : 'w-px',
          vertical
            ? 'after:absolute after:inset-x-0 after:top-1/2 after:h-1 after:w-full after:-translate-y-1/2'
            : 'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          className
        )}
        {...props}
        elementRef={ref}
      >
        {withHandle && (
          <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-background">
            <ColumnsIcon
              aria-hidden
              className={cn('size-2.5 text-muted-foreground', vertical && 'rotate-90')}
            />
          </div>
        )}
        {children}
      </Separator>
    )
  }
)
ResizableHandle.displayName = 'ResizableHandle'

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
