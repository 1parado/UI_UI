import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'
import {
  type StatisticFormat,
  formatStatisticValue,
  interpolateStatistic,
  prefersReducedMotion,
} from '@/lib/statistic'
import { TrendingDownIcon, TrendingUpIcon } from '@/lib/icons'

const statisticVariants = cva('text-card-foreground', {
  variants: {
    variant: {
      bare: '',
      card: 'rounded-lg border border-border bg-card p-4 shadow-sm',
    },
    size: {
      sm: 'text-xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    },
  },
  defaultVariants: { variant: 'bare', size: 'md' },
})

export type StatisticTrend = 'up' | 'down' | 'flat'

export interface StatisticProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof statisticVariants>,
    StatisticFormat {
  /** The figure. Pass a string to take over formatting entirely. */
  value: number | string
  /** What the figure counts. */
  label?: React.ReactNode
  /**
   * Direction of travel. Paired with `higherIsBetter` it decides whether the
   * arrow reads as good news: leave it alone for revenue, turn it around for
   * error rates, latency and spend.
   */
  trend?: StatisticTrend
  /** Written next to the arrow, already formatted by `StatisticFormat`. */
  trendValue?: React.ReactNode
  higherIsBetter?: boolean
  /** Note under the figure. */
  hint?: React.ReactNode
  /** Draws skeleton bars instead of a figure. */
  loading?: boolean
  /** Take over the figure's own markup. */
  formatter?: (value: number | string) => React.ReactNode
  /** Count up from the number currently shown. Ignored at `duration` 0. */
  countUp?: boolean
  /** Milliseconds. Defaults to 0, which means no animation at all. */
  duration?: number
  icon?: React.ReactNode
}

/**
 * One figure, formatted properly.
 *
 * Where `Stat` is the card — label, delta, trend line, all of it laid out — this
 * is the *number*: thousands separators, a fixed precision, a currency mark that
 * belongs outside the minus sign, and `—` where a value failed to arrive. That
 * last one matters more than it looks: a dashboard showing `NaN` has quietly
 * told its reader that nobody checked.
 *
 * `countUp` eases from the previously shown figure rather than from zero, so a
 * live number updates without lurching back to nothing first — and it is skipped
 * entirely for anyone who has asked their system to reduce motion.
 *
 * ```tsx
 * <Statistic label="MRR" value={84310} precision={0} prefix="¥" trend="up" trendValue="+12.4%" />
 * ```
 */
const Statistic = React.forwardRef<HTMLDivElement, StatisticProps>(
  (
    {
      value,
      label,
      variant,
      size,
      trend,
      trendValue,
      higherIsBetter = true,
      hint,
      loading = false,
      formatter,
      countUp = false,
      duration = 0,
      icon,
      precision,
      decimalSeparator,
      groupSeparator,
      prefix,
      suffix,
      fallback,
      className,
      ...props
    },
    ref
  ) => {
    const shown = React.useRef<number>(
      typeof value === 'number' ? (countUp && duration > 0 ? 0 : value) : 0
    )
    const [animateFrom, setAnimateFrom] = React.useState<number | null>(null)

    const animate =
      countUp &&
      duration > 0 &&
      typeof value === 'number' &&
      !prefersReducedMotion()

    React.useEffect(() => {
      if (!animate) {
        shown.current = typeof value === 'number' ? value : shown.current
        return
      }

      const from = shown.current
      const to = value as number
      let frame = 0
      let started: number | null = null

      const tick = (time: number) => {
        if (started === null) started = time
        const progress = Math.min(1, (time - started) / duration)
        const next = interpolateStatistic(from, to, progress)

        shown.current = next
        setAnimateFrom(next)

        if (progress < 1) frame = requestAnimationFrame(tick)
        else setAnimateFrom(null)
      }

      frame = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(frame)
      // `animate` already folds in `countUp`, `duration` and the motion query,
      // so the effect only has to answer to a new target value.
    }, [value, animate, duration])

    const target =
      typeof value === 'number' && animate ? (animateFrom ?? shown.current) : value

    const figure = React.useMemo(() => {
      if (formatter) return formatter(value)

      if (typeof target === 'number') {
        return formatStatisticValue(target, {
          precision,
          decimalSeparator,
          groupSeparator,
          prefix,
          suffix,
          fallback,
        })
      }

      return target === '' ? target : `${prefix ?? ''}${target}${suffix ?? ''}`
    }, [formatter, value, target, precision, decimalSeparator, groupSeparator, prefix, suffix, fallback])

    const good =
      trend === undefined || trend === 'flat'
        ? null
        : trend === 'up'
          ? higherIsBetter
          : !higherIsBetter

    return (
      <div
        ref={ref}
        data-trend={trend}
        className={cn('w-full', statisticVariants({ variant }), className)}
        {...props}
      >
        {label && (
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
        )}

        {loading ? (
          <Skeleton className={cn('mt-2 h-8 w-2/3', size === 'lg' && 'h-10')} />
        ) : (
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className={cn(
                'font-semibold tracking-tight tabular-nums',
                size === 'sm' && 'text-xl',
                size === 'md' && 'text-3xl',
                size === 'lg' && 'text-4xl'
              )}
            >
              {figure}
            </span>

            {trendValue && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-medium tabular-nums',
                  good === null && 'text-muted-foreground',
                  good === true && 'text-success',
                  good === false && 'text-destructive'
                )}
              >
                {trend === 'up' && <TrendingUpIcon aria-hidden="true" className="h-4 w-4" />}
                {trend === 'down' && <TrendingDownIcon aria-hidden="true" className="h-4 w-4" />}
                {trendValue}
              </span>
            )}
          </div>
        )}

        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  }
)
Statistic.displayName = 'Statistic'

export { Statistic, statisticVariants }
