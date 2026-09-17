import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/Sparkline'
import { TrendingDownIcon, TrendingUpIcon } from '@/lib/icons'

const statVariants = cva('text-card-foreground', {
  variants: {
    variant: {
      card: 'rounded-lg border border-border bg-card p-4 shadow-sm',
      bare: '',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
})

export interface StatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof statVariants> {
  /** What the number measures, e.g. "Monthly recurring revenue". */
  label: React.ReactNode
  /** The headline figure. Pass a preformatted string to control units. */
  value: React.ReactNode
  /**
   * Change against the previous period, as a percentage. The sign picks the
   * arrow; `higherIsBetter` decides whether that reads as good news.
   */
  delta?: number
  /** Text after the delta, e.g. "vs last week". */
  deltaLabel?: React.ReactNode
  /** Override how the delta number itself is written. */
  deltaFormat?: (delta: number) => React.ReactNode
  /**
   * Whether a rise is good news. Leave `true` for the usual business metrics;
   * set `false` where a rise is bad — stock prices, error rates, latency,
   * spend — and the colours and arrows follow.
   */
  higherIsBetter?: boolean
  /** Optional note under the value. */
  hint?: React.ReactNode
  /** Trend series, drawn along the bottom of the card. */
  sparkline?: number[]
  /** Icon in the top-right corner. */
  icon?: React.ReactNode
}

const defaultDeltaFormat = (delta: number) =>
  `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`

/**
 * A single metric: label, figure, change and an optional trend line. The
 * building block for a dashboard row.
 *
 * ```tsx
 * <Stat
 *   label="Tokens used"
 *   value="1.24M"
 *   delta={12.4}
 *   deltaLabel="vs last week"
 *   sparkline={[820, 932, 901, 1120, 1240]}
 * />
 * ```
 */
const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      className,
      variant,
      label,
      value,
      delta,
      deltaLabel,
      deltaFormat = defaultDeltaFormat,
      higherIsBetter = true,
      hint,
      sparkline,
      icon,
      ...props
    },
    ref
  ) => {
    const direction = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
    const good =
      direction === 'flat' ? null : direction === 'up' ? higherIsBetter : !higherIsBetter

    return (
      <div
        ref={ref}
        data-trend={direction}
        className={cn(statVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && (
            <span
              aria-hidden="true"
              className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
            >
              {icon}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>

          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium tabular-nums',
                good === null && 'text-muted-foreground',
                good === true && 'text-success',
                good === false && 'text-destructive'
              )}
            >
              {direction === 'up' && (
                <TrendingUpIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {direction === 'down' && (
                <TrendingDownIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {deltaFormat(delta)}
              {deltaLabel && (
                <span className="font-normal text-muted-foreground">{deltaLabel}</span>
              )}
            </span>
          )}
        </div>

        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

        {sparkline && sparkline.length > 0 && (
          <Sparkline
            data={sparkline}
            area
            className="mt-3 h-8 w-full text-muted-foreground"
          />
        )}
      </div>
    )
  }
)
Stat.displayName = 'Stat'

export { Stat, statVariants }
