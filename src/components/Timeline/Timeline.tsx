import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const timelineDotVariants = cva(
  'relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full [&>svg]:size-3',
  {
    variants: {
      status: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/15 text-warning',
        destructive: 'bg-destructive/15 text-destructive',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
)

export interface TimelineItemProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, 'title'>,
    VariantProps<typeof timelineDotVariants> {
  /** Headline for the entry. */
  title?: React.ReactNode
  /** Supporting line under the title. */
  description?: React.ReactNode
  /** Right-aligned time, date or duration. */
  timestamp?: React.ReactNode
  /** Replaces the dot with your own marker — a step number, an avatar, a tool icon. */
  icon?: React.ReactNode
}

/**
 * One entry in a `Timeline`.
 *
 * The connector is drawn from the dot down past the item's own box so it spans
 * the gap to the next entry; `Timeline` hides it on the last child, which is
 * why the list uses `gap` rather than bottom padding — a trailing gap would
 * leave empty space under the final entry.
 */
const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, title, description, timestamp, icon, status, children, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="timeline-item"
      data-status={status ?? 'default'}
      className={cn('relative flex gap-3', className)}
      {...props}
    >
      <span
        aria-hidden
        data-timeline-line
        className="absolute left-[9.5px] top-5 -bottom-6 w-px bg-border"
      />
      <span className={cn(timelineDotVariants({ status }))}>{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-1">
        {(title || timestamp) && (
          <div className="flex items-baseline justify-between gap-3">
            {title && <span className="text-sm font-medium">{title}</span>}
            {timestamp && (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {timestamp}
              </span>
            )}
          </div>
        )}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </li>
  )
)
TimelineItem.displayName = 'TimelineItem'

export type TimelineProps = React.HTMLAttributes<HTMLOListElement>

/**
 * Ordered activity list — an agent's step chain, an audit trail, a changelog.
 *
 * ```tsx
 * <Timeline>
 *   <TimelineItem title="Read src/index.ts" timestamp="09:41" status="success" />
 *   <TimelineItem title="Edit src/app.tsx" timestamp="09:42" status="primary">
 *     <CodeBlock code={patch} language="diff" />
 *   </TimelineItem>
 * </Timeline>
 * ```
 */
const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      data-slot="timeline"
      className={cn(
        'flex flex-col gap-6',
        // Nothing follows the last entry, so its connector has no destination.
        '[&>li:last-child>[data-timeline-line]]:hidden',
        className
      )}
      {...props}
    />
  )
)
Timeline.displayName = 'Timeline'

export { Timeline, TimelineItem }
