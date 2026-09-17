import * as React from 'react'
import { cn } from '@/lib/utils'

export interface WatermarkFont {
  fontSize?: number
  fontWeight?: number | string
  fontFamily?: string
  /**
   * Ink colour. A mid grey with alpha is the default because it has to read on
   * a white page *and* a near-black one — a pure black watermark disappears in
   * dark mode, and a white one disappears in light mode.
   */
  color?: string
  /** Extra line height, in multiples of the font size. */
  lineHeight?: number
}

export interface WatermarkProps
  // `content` is a real DOM attribute (on `<meta>`), and it is a string there.
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** One line, or several drawn as a block. */
  content?: string | string[]
  /** An image to tile instead of text. Wins over `content`. */
  image?: string
  font?: WatermarkFont
  /** Horizontal and vertical space between tiles, in pixels. */
  gap?: [number, number]
  /** Counter-clockwise rotation in degrees. -22 is the familiar diagonal. */
  rotate?: number
  /** 0–1, applied to the whole tile. */
  opacity?: number
  zIndex?: number
  /**
   * Restore the mark if something removes it. On by default: a watermark that
   * can be deleted from devtools is not a watermark.
   */
  guard?: boolean
  children?: React.ReactNode
}

interface Tile {
  url: string
  width: number
  height: number
}

let canvasSupport: boolean | null = null

/** Whether this environment can actually rasterise, asked once per session. */
function supportsCanvas(): boolean {
  if (canvasSupport !== null) return canvasSupport
  try {
    const probe = document.createElement('canvas')
    canvasSupport = typeof probe.getContext === 'function' && Boolean(probe.getContext('2d'))
  } catch {
    canvasSupport = false
  }
  return canvasSupport
}

/**
 * Tiles a mark across whatever it wraps.
 *
 * Drawn on a canvas and used as a repeating background rather than as many
 * DOM nodes: a thousand `<span>`s would dominate the layout and the
 * accessibility tree for something that carries no information. The layer is
 * `pointer-events: none` and `aria-hidden`, so it never intercepts a click and
 * never reaches a screen reader.
 *
 * The guard exists because the first thing anyone does with a watermark is
 * delete it in devtools. A `MutationObserver` puts the layer back when the
 * background, the style, or the element itself is changed. It is a speed bump,
 * not a lock — anything reachable from the console can be defeated — but it
 * makes casual removal visibly futile.
 *
 * Nothing is drawn where `canvas.getContext('2d')` is unavailable (jsdom
 * without the `canvas` package), and the children still render.
 *
 * ```tsx
 * <Watermark content={['Acme Corp', user.email]} gap={[120, 80]} />
 * ```
 */
const Watermark = React.forwardRef<HTMLDivElement, WatermarkProps>(
  (
    {
      className,
      content,
      image,
      font,
      gap = [100, 80],
      rotate = -22,
      opacity = 1,
      zIndex = 5,
      guard = true,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const layerRef = React.useRef<HTMLDivElement>(null)
    const [tile, setTile] = React.useState<Tile | null>(null)
    const styleRef = React.useRef<React.CSSProperties | undefined>(undefined)

    const {
      fontSize = 16,
      fontWeight = 400,
      fontFamily = 'system-ui, sans-serif',
      color = 'rgba(128, 128, 128, 0.22)',
      lineHeight = 1.4,
    } = font ?? {}

    const lines = React.useMemo(
      () => (content === undefined ? [] : Array.isArray(content) ? content : [content]),
      [content]
    )

    // Destructured before the effect: an array literal in `gap` would be a new
    // object every render, and the effect would redraw forever.
    const gapX = gap[0]
    const gapY = gap[1]

    // The tile is redrawn whenever anything that changes its size changes.
    React.useEffect(() => {
      if (image) {
        setTile({ url: image, width: 0, height: 0 })
        return
      }
      if (lines.length === 0) {
        setTile(null)
        return
      }

      const canvas = document.createElement('canvas')
      // No 2D context (jsdom without `canvas`) — draw nothing rather than
      // throw. Cached, because asking again is the expensive part.
      if (!supportsCanvas()) {
        setTile(null)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setTile(null)
        return
      }

      const ctx2d = ctx as CanvasRenderingContext2D
      const fontSpec = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx2d.font = fontSpec

      const rotation = (rotate * Math.PI) / 180
      const textWidth = Math.max(...lines.map((line) => ctx2d.measureText(line).width))
      const textHeight = lines.length * fontSize * lineHeight

      // The tile has to be big enough for the rotated text plus one gap, or
      // the repeats cut each other off.
      const width = Math.ceil(textWidth + Math.abs(textHeight * Math.sin(rotation)) + gapX)
      const height = Math.ceil(
        Math.abs(textWidth * Math.sin(rotation)) + textHeight * Math.cos(rotation) + gapY
      )

      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx2d.scale(ratio, ratio)
      ctx2d.font = fontSpec
      ctx2d.fillStyle = color
      ctx2d.textAlign = 'center'
      ctx2d.textBaseline = 'middle'

      ctx2d.translate(width / 2, height / 2)
      ctx2d.rotate(rotation)

      lines.forEach((line, index) => {
        const y = (index - (lines.length - 1) / 2) * fontSize * lineHeight
        ctx2d.fillText(line, 0, y)
      })

      setTile({ url: canvas.toDataURL('image/png'), width, height })
    }, [image, lines, fontSize, fontWeight, fontFamily, color, lineHeight, rotate, gapX, gapY])

    // Put the mark back if it is edited or removed.
    React.useEffect(() => {
      if (!guard) return
      const container = containerRef.current
      const layer = layerRef.current
      if (!container || !layer || typeof MutationObserver === 'undefined') return

      const options = { childList: true, attributes: true, subtree: true } as const

      const restore = () => {
        // Disconnect first: re-applying the style *is* a mutation, and the
        // observer would otherwise be woken by its own repair, forever.
        observer.disconnect()

        if (layer.parentElement !== container) container.appendChild(layer)
        // Re-apply the paint too: deleting `background-image` in devtools is
        // the other way to make a watermark go away.
        if (styleRef.current) Object.assign(layer.style, styleRef.current)

        observer.observe(container, options)
      }

      const observer = new MutationObserver(restore)
      observer.observe(container, options)

      return () => observer.disconnect()
    }, [guard, tile])

    const layerStyle: React.CSSProperties | undefined = tile
      ? {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url(${tile.url})`,
          backgroundRepeat: 'repeat',
          ...(tile.width > 0 ? { backgroundSize: `${tile.width}px ${tile.height}px` } : {}),
          opacity,
          zIndex,
        }
      : undefined
    styleRef.current = layerStyle

    return (
      <div
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        data-slot="watermark"
        className={cn('relative', className)}
        style={style}
        {...props}
      >
        {children}
        {layerStyle && (
          <div ref={layerRef} aria-hidden data-slot="watermark-layer" style={layerStyle} />
        )}
      </div>
    )
  }
)
Watermark.displayName = 'Watermark'

export { Watermark }
