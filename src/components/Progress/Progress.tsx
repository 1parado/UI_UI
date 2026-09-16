import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressIndicatorVariants = cva(
  'h-full transition-all duration-500 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        warning: 'bg-warning',
        destructive: 'bg-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressIndicatorVariants> {
  /** Current progress value, between 0 and `max`. */
  value?: number
  /** Maximum value. Defaults to 100. */
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, 0), max)
    const percent = max > 0 ? Math.round((clamped / max) * 100) : 0

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
