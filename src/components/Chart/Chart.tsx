import * as React from 'react'
import { Legend, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts'
import { cn } from '@/lib/utils'

export interface ChartSeriesConfig {
  /** Human label for legends and tooltips. Falls back to the series key. */
  label?: string
  /** Any CSS colour. Defaults to the next categorical slot. */
  color?: string
  icon?: React.ComponentType<{ className?: string }>
}

/** Series keyed by the `dataKey` used in the chart. */
export type ChartConfig = Record<string, ChartSeriesConfig>

/**
 * The five categorical slots. `ChartContainer` also exposes each config key as
 * `var(--color-<key>)`, which is what a series should actually reference —
 * naming the series instead of the slot is what keeps a colour attached to the
 * same meaning when the chart changes.
 */
export const chartPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue>({ config: {} })

/** The `config` of the nearest `ChartContainer`. */
export function useChart() {
  return React.useContext(ChartContext)
}

/** A length recharts accepts: a pixel count, or an explicit percentage string. */
export type ChartDimension = number | `${number}%`

export interface ChartContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'style'> {
  config: ChartConfig
  /** A single recharts chart element. */
  children: React.ReactElement
  /**
   * Width and height of the plotting area. Percentages by default, in which
   * case something above this must have a height — a chart that renders
   * nothing is almost always a responsive container inside an unsized parent.
   */
  width?: ChartDimension
  height?: ChartDimension
  /** Height derived from width, instead of an explicit `height`. */
  aspect?: number
  /**
   * Size to assume before the first measurement. Worth setting when the chart
   * is server rendered or appears in a modal that animates its width.
   */
  initialDimension?: { width: number; height: number }
  /** Replaces the chart when there is no data to draw. */
  empty?: React.ReactNode
  /** Set when the series are empty. Pairs with `empty`. */
  isEmpty?: boolean
  style?: React.CSSProperties
}

/**
 * Wraps one recharts chart and puts the library's tokens underneath it.
 *
 * recharts is deliberately wide open — every axis, grid and series takes its
 * own colour — which means every project that uses it re-invents the same
 * palette, the same tooltip and the same empty state. This container is that
 * layer: it resolves `config` into `--color-<series>` variables so a series
 * references its *name* rather than a hex value, and it is what `ChartTooltip`
 * reads to label a hovered point.
 *
 * ```tsx
 * <ChartContainer
 *   className="h-[260px] w-full"
 *   config={{ desktop: { label: 'Desktop', color: 'var(--chart-1)' } }}
 * >
 *   <AreaChart data={rows}>
 *     <Area dataKey="desktop" fill="var(--color-desktop)" stroke="var(--color-desktop)" />
 *   </AreaChart>
 * </ChartContainer>
 * ```
 */
const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      className,
      config,
      children,
      width = '100%',
      height = '100%',
      aspect,
      initialDimension,
      empty,
      isEmpty = false,
      style,
      ...props
    },
    ref
  ) => {
    const variables = React.useMemo(() => {
      const out: Record<string, string> = {}
      const entries = Object.entries(config)

      entries.forEach(([key, series], index) => {
        const fallback = chartPalette[index % chartPalette.length]
        const color = series.color ?? fallback
        out[`--color-${key}`] = color
        out[`--chart-${index + 1}`] = color
      })

      return out as React.CSSProperties
    }, [config])

    return (
      <div
        ref={ref}
        data-chart
        className={cn('relative w-full', className)}
        style={{ ...variables, ...style }}
        {...props}
      >
        <ChartContext.Provider value={{ config }}>
          {isEmpty ? (
            <div
              className="flex items-center justify-center text-sm text-muted-foreground"
              style={{ height: typeof height === 'number' ? height : undefined }}
            >
              {empty}
            </div>
          ) : (
            <ResponsiveContainer
              width={width}
              height={height}
              aspect={aspect}
              initialDimension={initialDimension}
            >
              {children}
            </ResponsiveContainer>
          )}
        </ChartContext.Provider>
      </div>
    )
  }
)
ChartContainer.displayName = 'ChartContainer'

export interface ChartTooltipItem {
  name?: string | number
  dataKey?: string | number
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
}

export interface ChartTooltipContentProps {
  active?: boolean
  payload?: readonly ChartTooltipItem[]
  label?: unknown
  className?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  /** Marker shape. `dot` reads best for two or three series, `line` for many. */
  indicator?: 'dot' | 'line' | 'dashed'
  formatter?: (value: ChartTooltipItem['value'], item: ChartTooltipItem) => React.ReactNode
  labelFormatter?: (label: unknown) => React.ReactNode
  /**
   * Overrides the container's config. Only needed when the body is rendered on
   * its own, outside a `ChartContainer`.
   */
  config?: ChartConfig
}

const indicatorClassName: Record<NonNullable<ChartTooltipContentProps['indicator']>, string> = {
  dot: 'size-2 rounded-[2px]',
  line: 'h-3 w-1 rounded-full',
  dashed: 'h-3 w-0 border-l-2 border-dashed',
}

/**
 * The tooltip body. Reads `config` for the series label, so a hovered point
 * says "Desktop · 1,204" rather than "desktop".
 */
function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
  formatter,
  labelFormatter,
  config: configProp,
}: ChartTooltipContentProps) {
  const { config: contextConfig } = useChart()
  const config = configProp ?? contextConfig

  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        'grid min-w-32 gap-1.5 rounded-lg border border-border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md',
        className
      )}
    >
      {!hideLabel && label != null && label !== '' && (
        <p className="font-medium">{labelFormatter ? labelFormatter(label) : String(label)}</p>
      )}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const series = config[key]
          const color = item.color ?? series?.color

          return (
            <div key={`${key}-${index}`} className="flex items-center gap-2">
              {!hideIndicator && (
                <span
                  aria-hidden
                  className={cn('shrink-0', indicatorClassName[indicator])}
                  style={{ background: color, borderColor: color }}
                />
              )}
              <span className="text-muted-foreground">
                {series?.label ?? item.name ?? key}
              </span>
              <span className="ml-auto font-medium tabular-nums">
                {formatter ? formatter(item.value, item) : String(item.value ?? '')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface ChartTooltipProps extends Omit<TooltipProps, 'content'> {
  /** Overrides for the default body. */
  content?: ChartTooltipContentProps
  className?: string
}

/** recharts' `Tooltip` with the library's body. Any recharts prop passes through. */
function ChartTooltip({ content, className, ...props }: ChartTooltipProps) {
  return (
    <Tooltip
      {...props}
      content={({ active, payload, label }) => (
        <ChartTooltipContent
          active={active}
          payload={payload as unknown as ChartTooltipItem[]}
          label={label}
          className={className}
          {...content}
        />
      )}
    />
  )
}

export interface ChartLegendProps extends Omit<React.ComponentProps<typeof Legend>, 'formatter'> {
  /** Reads `config` for each series' label. */
  labelFormatter?: (value: string) => React.ReactNode
}

/** recharts' `Legend`, with the series labels coming from `config`. */
function ChartLegend({ labelFormatter, ...props }: ChartLegendProps) {
  const { config } = useChart()

  return (
    <Legend
      {...props}
      formatter={(value) => {
        const key = String(value)
        if (labelFormatter) return labelFormatter(key)
        return config[key]?.label ?? key
      }}
    />
  )
}

export { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent }
