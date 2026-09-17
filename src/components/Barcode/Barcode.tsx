import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  type Code128Set,
  encodeCode128,
  moduleRuns,
  totalModules,
} from '@/lib/code128'

export interface BarcodeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the label says. ASCII only — anything else cannot be encoded. */
  value: string
  /** Force a symbol set instead of letting the encoder choose one. */
  codeSet?: Code128Set | 'auto'
  /** Height of the bars, in pixels. */
  height?: number
  /** Width of one module, in pixels. Raise it for printing. */
  moduleWidth?: number
  /**
   * Blank margin either side, in modules. The spec asks for 10; scanners use it
   * to find the edges of the symbol.
   */
  quietZone?: number
  /** Print the value under the bars. */
  showText?: boolean
  /** Accessible description. Defaults to the value itself. */
  label?: string
}

/**
 * A Code 128 barcode, drawn by hand.
 *
 * The symbology is small enough to own: `lib/code128` turns the text into
 * symbol values and those into module widths, and this component does nothing
 * but draw rectangles. No dependency, and nothing to keep up to date.
 *
 * **The polarity is not themeable, for the same reason as `QRCode`:** a barcode
 * is read by a laser, not an eye, and dark bars on a light background is what
 * both the specification and every scanner expect. Inverting it for dark mode
 * would produce something that looks striking and reads as nothing. So the
 * quiet zone comes out white whatever the surrounding theme.
 *
 * ```tsx
 * <Barcode value="SF-2026-0042" height={48} />
 * ```
 */
const Barcode = React.forwardRef<HTMLDivElement, BarcodeProps>(
  (
    {
      value,
      codeSet = 'auto',
      height = 56,
      moduleWidth = 2,
      quietZone = 10,
      showText = true,
      label,
      className,
      ...props
    },
    ref
  ) => {
    const encoded = React.useMemo(
      () => encodeCode128(value, { codeSet }),
      [value, codeSet]
    )

    const runs = React.useMemo(
      () => (encoded ? moduleRuns(encoded.values) : []),
      [encoded]
    )

    if (!encoded) {
      return (
        <div
          ref={ref}
          role="img"
          aria-label={label ?? `Cannot encode ${value} as Code 128`}
          className={cn(
            'inline-flex min-w-40 items-center justify-center bg-white px-3 py-2 text-center text-xs text-black/60',
            className
          )}
          {...props}
        >
          Not encodable as Code 128
        </div>
      )
    }

    const modules = totalModules(encoded.values) + quietZone * 2
    const width = modules * moduleWidth

    let cursor = quietZone

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col items-center gap-1 bg-white p-2', className)}
        {...props}
      >
        <svg
          role="img"
          aria-label={label ?? value}
          width={width}
          height={height}
          viewBox={`0 0 ${modules} 1`}
          shapeRendering="crispEdges"
          className="block max-w-full"
          style={{ height }}
        >
          {runs.map((run, index) => {
            const x = cursor
            cursor += run

            // Every second run is white: an empty module width against the
            // forced-white background. The bars are plain black for the same
            // reason — the foreground token would invert in dark mode.
            if (index % 2 === 1) return null

            return (
              <rect key={index} x={x} y={0} width={run} height={1} className="fill-black" />
            )
          })}
        </svg>

        {showText && (
          <span className="font-mono text-[11px] leading-none tracking-widest text-black">
            {value}
          </span>
        )}
      </div>
    )
  }
)
Barcode.displayName = 'Barcode'

export { Barcode }
