import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TypingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name announced while the dots are up. Defaults to "Thinking". */
  label?: string
}

/** Three quiet dots while the assistant has nothing to show yet. */
const TypingIndicator = React.forwardRef<
  HTMLDivElement,
  TypingIndicatorProps
>(({ className, label = 'Thinking', ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn('inline-flex items-center gap-1 py-1', className)}
    {...props}
  >
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        aria-hidden="true"
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none"
        style={{ animationDelay: `${index * 150}ms` }}
      />
    ))}
  </div>
))
TypingIndicator.displayName = 'TypingIndicator'

export { TypingIndicator }
