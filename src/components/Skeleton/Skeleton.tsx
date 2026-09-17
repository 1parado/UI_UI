import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  avatarSizes,
  columnWidths,
  paragraphWidths,
  type AvatarSize,
} from '@/lib/skeleton'

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

/** One bar. Compose the rest of this file for anything bigger. */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-busy="true"
      aria-hidden="true"
      {...props}
    />
  )
)
Skeleton.displayName = 'Skeleton'

export type SkeletonTextProps = Omit<SkeletonProps, 'children'> & {
  /** How many lines to draw. */
  lines?: number
  /** Width of the final line, in percent. */
  lastLineWidth?: number
}

export type SkeletonAvatarProps = Omit<SkeletonProps, 'children'> & {
  size?: AvatarSize
}

export type SkeletonCardProps = Omit<SkeletonProps, 'children'> & {
  /** A round blob beside the text, the way an avatar or icon sits. */
  avatar?: boolean
  lines?: number
}

export type SkeletonTableProps = Omit<SkeletonProps, 'children'> & {
  rows?: number
  columns?: number
  /** A taller first row standing in for the header. */
  header?: boolean
}

export type SkeletonButtonProps = Omit<SkeletonProps, 'children'> & {
  size?: 'sm' | 'md' | 'lg'
}

/**
 * A paragraph's worth of lines.
 *
 * The last line is deliberately short: a stack of identical full-width bars
 * reads as a table, and the ragged right edge is most of what tells a reader
 * they are looking at text.
 */
const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, lastLineWidth = 60, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="skeleton-text"
      className={cn('space-y-2', className)}
      {...props}
    >
      {paragraphWidths(lines, lastLineWidth).map((width, index) => (
        <Skeleton key={index} className="h-3" style={{ width: `${width}%` }} />
      ))}
    </div>
  )
)
SkeletonText.displayName = 'SkeletonText'

/** A circle standing in for an avatar. */
const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, style, ...props }, ref) => (
    <Skeleton
      ref={ref}
      data-slot="skeleton-avatar"
      data-size={size}
      className={cn('shrink-0 rounded-full', className)}
      style={{ width: avatarSizes[size], height: avatarSizes[size], ...style }}
      {...props}
    />
  )
)
SkeletonAvatar.displayName = 'SkeletonAvatar'

/** The shape of a list row or card: a round blob with text beside it. */
const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ avatar = true, lines = 3, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="skeleton-card"
      className={cn('rounded-lg border border-border p-4', className)}
      {...props}
    >
      <div className="flex gap-3">
        {avatar && <SkeletonAvatar />}
        <SkeletonText lines={lines} className="flex-1" />
      </div>
    </div>
  )
)
SkeletonCard.displayName = 'SkeletonCard'

/**
 * A table's worth of cells.
 *
 * The first column is wider because that is where the thing you came to read
 * usually is; the rest share what is left.
 */
const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 4, columns = 4, header = true, className, ...props }, ref) => {
    const widths = columnWidths(columns)

    return (
      <div
        ref={ref}
        data-slot="skeleton-table"
        className={cn('space-y-3', className)}
        {...props}
      >
        {Array.from({ length: rows + (header ? 1 : 0) }, (_, row) => (
          <div key={row} className="flex items-center gap-4">
            {widths.map((width, column) => (
              <Skeleton
                key={column}
                className={cn('h-3', header && row === 0 && 'h-4')}
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }
)
SkeletonTable.displayName = 'SkeletonTable'

/** A bar shaped like a button. */
const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      data-slot="skeleton-button"
      data-size={size}
      className={cn(
        'rounded-md',
        size === 'sm' && 'h-8 w-16',
        size === 'md' && 'h-9 w-20',
        size === 'lg' && 'h-10 w-24',
        className
      )}
      {...props}
    />
  )
)
SkeletonButton.displayName = 'SkeletonButton'

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
}
