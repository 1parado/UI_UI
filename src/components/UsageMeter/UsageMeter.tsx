import * as React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '../Progress'
import { formatCompactNumber } from '@/lib/format'

export interface UsageMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Amount consumed, in whatever unit `label` describes. */
  used: number
  /** Budget. Omit for "no limit" — then only `used` is shown, without a bar. */
  max?: number
  /** Left-hand label, e.g. "Tokens" or "Cost". */
  label?: string
  /** Formats the numbers. Defaults to a compact formatter. */
  format?: (used: number, max?: number) => string
  /** Ratio at which the bar turns amber. Defaults to 0.8. */
  warnAt?: number
}

function defaultFormat(used: number, max?: number): string {
  return max === undefined
    ? formatCompactNumber(used)
    : `${formatCompactNumber(used)} / ${formatCompactNumber(max)}`
}

/**
 * Token / cost budget readout. Purely presentational — pass numbers, or a
 * `format` function when the unit needs currency or a suffix.
 */
const UsageMeter = React.forwardRef<HTMLDivElement, UsageMeterProps>(
  (
    { className, used, max, label, format = defaultFormat, warnAt = 0.8, ...props },
    ref
  ) => {
    const ratio = max === undefined || max <= 0 ? 0 : used / max
    const variant =
      max !== undefined && ratio >= 1
        ? 'destructive'
        : ratio >= warnAt
          ? 'warning'
          : 'default'

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
      >
        <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          <span className={cn('tabular-nums', !label && 'ml-auto')}>
            {format(used, max)}
          </span>
        </div>

        {max !== undefined && (
          <Progress
            value={used}
            max={max}
            variant={variant}
            aria-label={label ? `${label} usage` : 'Usage'}
          />
        )}
      </div>
    )
  }
)
UsageMeter.displayName = 'UsageMeter'

export { UsageMeter }
