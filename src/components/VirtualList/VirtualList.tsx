import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

export interface VirtualListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly T[]
  /**
   * Row height in pixels. A number is the fast path — the virtualizer then
   * knows every position without measuring anything. Pass a function when rows
   * differ but you can still guess them.
   */
  estimateSize: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  /** Stable identity for a row, so a reorder does not rebuild the DOM under it. */
  getItemKey?: (item: T, index: number) => React.Key
  /**
   * Height of the scroll container. Required: a virtual list needs one fixed
   * dimension to know what "visible" means. Pass `100%` and give the parent a
   * height, or a number for a fixed pane.
   */
  height?: number | string
  /** Rows rendered beyond the viewport. Higher means smoother scrolling, more DOM. */
  overscan?: number
  /**
   * Measure rows with a `ResizeObserver` instead of trusting `estimateSize`.
   * Needed for rows whose height depends on their content; costs a reflow per
   * row and defeats the fast path, so it is off by default.
   */
  measure?: boolean
  /** Called when the last `endReachedThreshold` rows come into view. */
  onEndReached?: () => void
  endReachedThreshold?: number
  /** Rendered instead of the list when `items` is empty. */
  empty?: React.ReactNode
  /** Applied to the scrolling element rather than the outer box. */
  scrollClassName?: string
}

/**
 * Windowed list — renders the rows that are on screen and little else.
 *
 * Ten thousand rows in a plain `.map()` is ten thousand elements and a tab that
 * takes a second to answer; this keeps it at roughly `viewport / rowHeight +
 * overscan`, which is a constant. That constness is the whole point, so
 * `estimateSize` should be accurate: the fast path never measures.
 *
 * The list does not impose `role="list"`, because what a row *is* depends on
 * the caller — a table wants `role="row"`, a log wants nothing. Set the roles
 * on the outer element (via props) and inside `renderItem`.
 *
 * ```tsx
 * <VirtualList
 *   items={rows}
 *   estimateSize={40}
 *   height={400}
 *   getItemKey={(row) => row.id}
 *   renderItem={(row) => <div className="h-10 px-3 leading-10">{row.name}</div>}
 * />
 * ```
 */
function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  getItemKey,
  height = 400,
  overscan = 6,
  measure = false,
  onEndReached,
  endReachedThreshold = 3,
  empty,
  className,
  scrollClassName,
  ...props
}: VirtualListProps<T>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize:
      typeof estimateSize === 'number' ? () => estimateSize : estimateSize,
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  })

  const rows = virtualizer.getVirtualItems()
  const lastIndex = rows.length > 0 ? rows[rows.length - 1].index : -1

  // The callback is held in a ref so a caller passing an inline arrow does not
  // re-fire the effect on every render and re-trigger the fetch.
  const endReachedRef = React.useRef(onEndReached)
  endReachedRef.current = onEndReached

  React.useEffect(() => {
    if (items.length === 0 || lastIndex < 0) return
    if (lastIndex < items.length - 1 - endReachedThreshold) return
    endReachedRef.current?.()
  }, [lastIndex, items.length, endReachedThreshold])

  return (
    <div
      ref={scrollRef}
      style={{ height }}
      className={cn('overflow-auto', scrollClassName)}
      {...props}
    >
      {items.length === 0 ? (
        <div className={cn('p-4 text-sm text-muted-foreground', className)}>{empty}</div>
      ) : (
        <div
          className={cn('relative w-full', className)}
          style={{ height: virtualizer.getTotalSize() }}
        >
          {rows.map((row) => (
            <div
              key={row.key}
              // The virtualizer reads this back when measuring; it is also a
              // handy hook for tests and consumer styles.
              data-index={row.index}
              ref={measure ? virtualizer.measureElement : undefined}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              {renderItem(items[row.index], row.index)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { VirtualList }
