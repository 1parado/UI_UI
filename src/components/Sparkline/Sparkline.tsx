import * as React from 'react'
import { cn } from '@/lib/utils'

/** Keeps the stroke from being clipped at the edges of the box. */
const PADDING = 2

export interface SparklineProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  /** Values in draw order, oldest first. */
  data: number[]
  /** Fill the area under the line. */
  area?: boolean
  /** Draw a vertical rule at the final value. */
  showLastLine?: boolean
  /** Pin the bottom of the scale instead of deriving it from the data. */
  min?: number
  /** Pin the top of the scale instead of deriving it from the data. */
  max?: number
  /** Coordinate-space width. The SVG stretches to its container. */
  width?: number
  /** Coordinate-space height. */
  height?: number
  /** Accessible summary. Without it the sparkline is treated as decorative. */
  label?: string
}

/**
 * A trend line with no axes, no labels and no tooltip — the shape of a series
 * at a glance, sized for a table cell or the corner of a stat card.
 *
 * The coordinate space is fixed and the SVG stretches to its container, so the
 * line always fills the width it is given. `vectorEffect` keeps the stroke from
 * stretching with it; that is also why the final-value marker is a rule rather
 * than a dot — a circle would be squashed into an ellipse.
 *
 * ```tsx
 * <Sparkline data={[12, 18, 15, 22, 31]} area label="Requests over the last 5 days" />
 * ```
 */
const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      className,
      data,
      area = false,
      showLastLine = false,
      min,
      max,
      width = 100,
      height = 32,
      label,
      ...props
    },
    ref
  ) => {
    const points = React.useMemo(() => {
      const count = data.length
      if (count === 0) return []

      const low = min ?? Math.min(...data)
      const high = max ?? Math.max(...data)
      const flat = high === low
      const innerWidth = width - PADDING * 2
      const innerHeight = height - PADDING * 2
      const stepX = count > 1 ? innerWidth / (count - 1) : 0

      // A flat series sits on the middle line rather than on the floor.
      const at = (value: number) =>
        height - PADDING - (flat ? 0.5 : (value - low) / (high - low)) * innerHeight

      if (count === 1) {
        // One value is a level, not a trend — draw it as a full-width rule.
        return [
          [PADDING, at(data[0])],
          [width - PADDING, at(data[0])],
        ] as [number, number][]
      }

      return data.map(
        (value, index) => [PADDING + index * stepX, at(value)] as [number, number]
      )
    }, [data, min, max, width, height])

    const line = points.map(([x, y]) => `${x},${y}`).join(' ')
    const baseline = height - PADDING
    const filled = points.length
      ? `${line} ${width - PADDING},${baseline} ${PADDING},${baseline}`
      : ''
    const last = points[points.length - 1]

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={cn('h-8 w-full text-primary', className)}
        {...props}
      >
        {area && filled && <polygon points={filled} className="fill-current opacity-15" />}
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {showLastLine && last && (
          <line
            x1={last[0]}
            y1={PADDING}
            x2={last[0]}
            y2={baseline}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 2"
            className="opacity-40"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    )
  }
)
Sparkline.displayName = 'Sparkline'

export { Sparkline }
