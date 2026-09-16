import * as React from 'react'
import { cn } from '@/lib/utils'

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Orientation of the separator. */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Whether the separator is purely decorative. Decorative separators are
   * hidden from the accessibility tree; set `false` when the separator
   * carries meaning (e.g. separates two groups of content).
   */
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = 'Separator'

export { Separator }
