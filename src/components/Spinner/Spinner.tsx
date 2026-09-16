import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { LoaderIcon } from '@/lib/icons'

const spinnerVariants = cva('animate-spin motion-reduce:animate-none', {
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      default: 'h-4 w-4',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: { size: 'default' },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  /** Announced to screen readers. Pass `null` when a visible label is present. */
  label?: string | null
}

/**
 * Indeterminate activity indicator. Use it for waits over ~1s with no known
 * duration — when progress is measurable, use `Progress` instead.
 */
const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = 'Loading', ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center text-muted-foreground', className)}
      {...props}
    >
      <LoaderIcon className={cn(spinnerVariants({ size }))} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
