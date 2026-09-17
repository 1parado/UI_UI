import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { RefreshIcon, TrashIcon } from '@/lib/icons'

export interface SignatureHandle {
  /** Wipe the pad, leaving nothing signed. */
  clear: () => void
  /** Remove the last stroke. */
  undo: () => void
  /** Whether anything has been drawn since the last clear. */
  isEmpty: () => boolean
  /** A PNG (or JPEG) data URL of what is on the pad. */
  toDataURL: (type?: string, quality?: number) => string | null
}

export interface SignatureProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Height of the drawing area in pixels. */
  height?: number
  /** Colour of the ink. Defaults to the page's foreground colour. */
  penColor?: string
  lineWidth?: number
  /** Fill the exported file with a colour instead of leaving it transparent. */
  backgroundColor?: string
  disabled?: boolean
  /** Every stroke ends here, with the pad's current contents (or `null`). */
  onChange?: (dataURL: string | null) => void
  /** The written-in hint above the line while nothing is signed. */
  placeholder?: React.ReactNode
  /** Hide the control row and drive the pad through its ref instead. */
  showControls?: boolean
  clearLabel?: string
  undoLabel?: string
}

type Point = { x: number; y: number }

/**
 * A signature pad.
 *
 * Strokes are kept as point lists rather than painted straight into the canvas,
 * which buys three things that a canvas alone cannot do: the pad can resize with
 * its container and redraw instead of stretching, `undo` can drop one stroke
 * without wiping the rest, and `isEmpty` can answer without comparing pixels.
 *
 * The canvas is scaled for the device pixel ratio, so lines drawn on a retina
 * screen are lines rather than staircases. Export is a transparent PNG by
 * default, since a signature lands on top of a document rather than replacing
 * it — set `backgroundColor` when the destination wants flattened pixels.
 *
 * ```tsx
 * const pad = useRef<SignatureHandle>(null)
 * <Signature ref={pad} onChange={setSignature} />
 * ```
 */
const Signature = React.forwardRef<SignatureHandle, SignatureProps>(
  (
    {
      height = 180,
      penColor,
      lineWidth = 2,
      backgroundColor = 'transparent',
      disabled = false,
      onChange,
      placeholder = 'Sign here',
      showControls = true,
      clearLabel = 'Clear',
      undoLabel = 'Undo',
      className,
      ...props
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const strokes = React.useRef<Point[][]>([])
    const drawing = React.useRef(false)
    const [size, setSize] = React.useState({ width: 0, height: height })
    const [empty, setEmpty] = React.useState(true)

    const context = () => canvasRef.current?.getContext('2d') ?? null

    const ink = React.useCallback(() => {
      // Canvas needs an actual colour, not a variable. Reading it off the
      // element keeps the pad following the theme without hard-coding either.
      const node = canvasRef.current
      if (penColor) return penColor
      if (!node || typeof window.getComputedStyle !== 'function') return '#000000'
      return window.getComputedStyle(node).color || '#000000'
    }, [penColor])

    /** Repaint everything: the background, then each stroke in order. */
    const repaint = React.useCallback(() => {
      const node = canvasRef.current
      const ctx = context()
      if (!node || !ctx) return

      const ratio = window.devicePixelRatio || 1
      const width = Math.round(size.width * ratio)
      const canvasHeight = Math.round(size.height * ratio)

      if (node.width !== width || node.height !== canvasHeight) {
        node.width = width
        node.height = canvasHeight
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, size.width, size.height)

      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, size.width, size.height)
      }

      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = ink()

      for (const stroke of strokes.current) {
        if (stroke.length === 0) continue

        ctx.beginPath()
        const [first, ...rest] = stroke
        ctx.moveTo(first.x, first.y)

        if (stroke.length === 1) {
          // A tap should leave a dot, not nothing.
          ctx.lineTo(first.x, first.y)
        }

        for (const point of rest) ctx.lineTo(point.x, point.y)
        ctx.stroke()
      }
    }, [backgroundColor, ink, lineWidth, size.height, size.width])

    React.useEffect(() => {
      const node = canvasRef.current
      if (!node || typeof ResizeObserver !== 'function') return

      const observer = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (!box) return
        setSize((current) =>
          current.width === box.width && current.height === box.height
            ? current
            : { width: box.width, height: box.height }
        )
      })

      observer.observe(node)
      return () => observer.disconnect()
    }, [])

    React.useEffect(repaint, [repaint])

    const emit = React.useCallback(() => {
      const node = canvasRef.current
      const dataURL = node ? node.toDataURL('image/png') : null
      onChange?.(strokes.current.length === 0 ? null : dataURL)
    }, [onChange])

    const pointAt = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
      const box = event.currentTarget.getBoundingClientRect()
      return { x: event.clientX - box.left, y: event.clientY - box.top }
    }

    React.useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          strokes.current = []
          setEmpty(true)
          repaint()
          onChange?.(null)
        },
        undo: () => {
          strokes.current = strokes.current.slice(0, -1)
          setEmpty(strokes.current.length === 0)
          repaint()
          emit()
        },
        isEmpty: () => strokes.current.length === 0,
        toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? null,
      }),
      [repaint, onChange, emit]
    )

    const controls = (
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || empty}
          onClick={() => {
            strokes.current = strokes.current.slice(0, -1)
            setEmpty(strokes.current.length === 0)
            repaint()
            emit()
          }}
        >
          <RefreshIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {undoLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || empty}
          onClick={() => {
            strokes.current = []
            setEmpty(true)
            repaint()
            onChange?.(null)
          }}
        >
          <TrashIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {clearLabel}
        </Button>
      </div>
    )

    return (
      <div className={cn('w-full', className)} {...props}>
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-md border border-input bg-background',
            disabled && 'pointer-events-none opacity-60'
          )}
          style={{ height }}
        >
          {empty && !disabled && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6">
              <span className="mb-1 text-xs text-muted-foreground">{placeholder}</span>
              <span
                aria-hidden="true"
                className="h-px w-2/3 border-b border-dashed border-muted-foreground/60"
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={cn(
              'h-full w-full touch-none',
              disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
            )}
            aria-label="Signature pad"
            onPointerDown={(event) => {
              if (disabled) return
              event.currentTarget.setPointerCapture(event.pointerId)
              drawing.current = true
              strokes.current = [...strokes.current, [pointAt(event)]]
              setEmpty(false)
              repaint()
            }}
            onPointerMove={(event) => {
              if (disabled || !drawing.current) return
              strokes.current = strokes.current.map((stroke, index) =>
                index === strokes.current.length - 1 ? [...stroke, pointAt(event)] : stroke
              )
              repaint()
            }}
            onPointerUp={() => {
              if (disabled || !drawing.current) return
              drawing.current = false
              emit()
            }}
            onPointerLeave={() => {
              if (!drawing.current) return
              drawing.current = false
              emit()
            }}
            onPointerCancel={() => {
              drawing.current = false
              emit()
            }}
          />
        </div>

        {showControls && <div className="mt-2">{controls}</div>}
      </div>
    )
  }
)
Signature.displayName = 'Signature'

export { Signature }
