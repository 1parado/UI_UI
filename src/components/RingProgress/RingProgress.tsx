import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ringIndicatorVariants = cva(
  'transition-[stroke-dashoffset] duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'text-primary',
        success: 'text-success',
        warning: 'text-warning',
        destructive: 'text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface RingProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof ringIndicatorVariants> {
  /** Current progress, between 0 and `max`. */
  value?: number
  /** Maximum value. Defaults to 100. */
  max?: number
  /** Outer diameter in pixels. */
  size?: number
  /** Ring thickness in pixels. */
  thickness?: number
  /** Replace the default percentage with anything — a node, a count, a unit. */
  children?: React.ReactNode
  /** Turn the built-in percentage off when `children` is not enough on its own. */
  showValue?: boolean
  /** Override how the built-in percentage is written. */
  valueFormat?: (value: number, ratio: number) => React.ReactNode
  /** Small line under the value, e.g. the limit it is measured against. */
  caption?: React.ReactNode
  /** Accessible name. Without it the ring is decorative. */
  label?: string
}

/**
 * A progress ring for a single ratio — quota used, a score, a completion
 * percentage. Same min/max/`aria-valuenow` contract as `Progress`, so the two
 * are interchangeable apart from the shape.
 *
 * ```tsx
 * <RingProgress value={72} variant="warning" label="Storage used" caption="72 of 100 GB" />
 * ```
 */
const RingProgress = React.forwardRef<HTMLDivElement, RingProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 120,
      thickness = 10,
      variant,
      showValue = true,
      valueFormat,
      caption,
      label,
      children,
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(Math.max(value, 0), max)
    const ratio = max > 0 ? clamped / max : 0

    // The ring is drawn on the stroke's centre line, so the radius has to sit
    // half a thickness inside the box or the stroke clips at the edges.
    const radius = Math.max((size - thickness) / 2, 0)
    const circumference = 2 * Math.PI * radius
    const dashoffset = circumference * (1 - ratio)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-label={label}
        data-variant={variant ?? 'default'}
        // Size is geometry, not colour, so it stays in an inline variable
        // rather than a theme token.
        style={{ width: size, height: size }}
        className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
        {...props}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          // Start at twelve o'clock and grow clockwise.
          className="h-full w-full -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-secondary"
          />
          {ratio > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className={cn(ringIndicatorVariants({ variant }))}
            />
          )}
        </svg>

        {(children ?? showValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {children ?? (
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {valueFormat
                  ? valueFormat(clamped, ratio)
                  : `${Math.round(ratio * 100)}%`}
              </span>
            )}
            {caption && (
              <span className="mt-0.5 text-xs text-muted-foreground">{caption}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
RingProgress.displayName = 'RingProgress'

export { RingProgress, ringIndicatorVariants }
