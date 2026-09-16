import * as React from 'react'
import { cn } from '@/lib/utils'

export type EmptyProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Empty state placeholder. Compose with `EmptyTitle`, `EmptyDescription`
 * and any action element (e.g. `Button`).
 *
 * @example
 * ```tsx
 * <Empty>
 *   <EmptyTitle>No projects yet</EmptyTitle>
 *   <EmptyDescription>
 *     Create your first project to get started.
 *   </EmptyDescription>
 *   <Button>Create project</Button>
 * </Empty>
 * ```
 */
const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-8 text-center',
        className
      )}
      {...props}
    />
  )
)
Empty.displayName = 'Empty'

export type EmptyTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const EmptyTitle = React.forwardRef<HTMLHeadingElement, EmptyTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-base font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
)
EmptyTitle.displayName = 'EmptyTitle'

export type EmptyDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  EmptyDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'max-w-sm text-sm text-muted-foreground',
      className
    )}
    {...props}
  />
))
EmptyDescription.displayName = 'EmptyDescription'

export { Empty, EmptyTitle, EmptyDescription }
