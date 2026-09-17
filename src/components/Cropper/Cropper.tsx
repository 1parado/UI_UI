import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Slider } from '@/components/Slider'
import { useControllableNumber } from '@/lib/use-controllable-state'
import { RefreshIcon } from '@/lib/icons'

export interface CropperHandle {
  /** The cropped result as a data URL, or `null` before the image has loaded. */
  toDataURL: (type?: string, quality?: number) => string | null
  /** Back to the centred, unzoomed start. */
  reset: () => void
}

export interface CropperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  src: string
  /**
   * Width ÷ height of the crop box. Defaults to the container's own shape,
   * which is what you want for a free avatar-less crop; pass `1` for avatars.
   */
  aspect?: number
  shape?: 'rect' | 'circle'
  /** Height of the cropper in pixels. */
  height?: number
  zoom?: number
  defaultZoom?: number
  minZoom?: number
  maxZoom?: number
  /** Width of the exported image. Defaults to the crop's own pixel width. */
  outputWidth?: number
  /** Thirds lines inside the crop box. */
  showGrid?: boolean
  showControls?: boolean
  onZoomChange?: (zoom: number) => void
  /** The crop button was pressed. The handle gives the same image on demand. */
  onCrop?: (dataURL: string | null) => void
  cropLabel?: string
  resetLabel?: string
}

interface Box {
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return (min + max) / 2
  return Math.min(max, Math.max(min, value))
}

/**
 * Crop an image by moving it under a fixed window.
 *
 * The window is fixed and the picture moves — the way a phone's photo picker
 * behaves, and deliberately so: dragging one rectangle around another is two
 * problems wearing one coat, and "zoom, then slide what matters into frame" is
 * the gesture people already know. The picture Is kept *covering* the window,
 * so there is never a gap to crop into.
 *
 * Export draws only the crop rectangle out of the source image at its natural
 * resolution, so a 4000px photo produces a 4000px-wide crop rather than a
 * screenshot of the on-screen preview.
 *
 * ```tsx
 * <Cropper src={uploaded} aspect={1} shape="circle" onCrop={setAvatar} />
 * ```
 */
const Cropper = React.forwardRef<CropperHandle, CropperProps>(
  (
    {
      src,
      aspect,
      shape = 'rect',
      height = 320,
      zoom,
      defaultZoom = 1,
      minZoom = 1,
      maxZoom = 3,
      outputWidth,
      showGrid = true,
      showControls = true,
      onZoomChange,
      onCrop,
      cropLabel = 'Crop',
      resetLabel = 'Reset',
      className,
      ...props
    },
    ref
  ) => {
    const imageRef = React.useRef<HTMLImageElement>(null)
    const [box, setBox] = React.useState<Box>({ width: 0, height })
    const [natural, setNatural] = React.useState<Box>({ width: 0, height: 0 })
    const [offset, setOffset] = React.useState({ x: 0, y: 0 })
    const panning = React.useRef<{ x: number; y: number } | null>(null)

    const [currentZoom, setZoom] = useControllableNumber({
      value: zoom,
      defaultValue: defaultZoom,
      onValueChange: onZoomChange,
    })

    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const node = containerRef.current
      if (!node || typeof ResizeObserver !== 'function') return

      const observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect
        if (!rect) return
        setBox((current) =>
          current.width === rect.width ? current : { ...current, width: rect.width }
        )
      })

      observer.observe(node)
      return () => observer.disconnect()
    }, [])

    // How big the picture is once it covers the cropper, before zoom.
    const cover = React.useMemo(() => {
      if (box.width === 0 || box.height === 0 || natural.width === 0) {
        return { width: 0, height: 0, scale: 0 }
      }

      const scale = Math.max(box.width / natural.width, box.height / natural.height)
      return { width: natural.width * scale, height: natural.height * scale, scale }
    }, [box.height, box.width, natural.height, natural.width])

    const displayed = {
      width: cover.width * currentZoom,
      height: cover.height * currentZoom,
    }

    const crop: Box = React.useMemo(() => {
      if (box.width === 0 || box.height === 0) return { width: 0, height: 0 }

      const ratio = aspect ?? box.width / box.height
      const byWidth = Math.min(box.width, box.height * ratio)
      return { width: byWidth, height: byWidth / ratio }
    }, [aspect, box.height, box.width])

    // The picture may never leave the window uncovered, which is exactly the
    // amount of room there is to slide it.
    const slack = {
      x: Math.max(0, (displayed.width - crop.width) / 2),
      y: Math.max(0, (displayed.height - crop.height) / 2),
    }

    const settle = (next: { x: number; y: number }) => ({
      x: clamp(next.x, -slack.x, slack.x),
      y: clamp(next.y, -slack.y, slack.y),
    })

    /** The crop window measured against the source image, in source pixels. */
    const exportDataURL = React.useCallback(
      (type = 'image/png', quality?: number): string | null => {
        const image = imageRef.current
        if (!image || natural.width === 0 || crop.width === 0) return null

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        const perPixel = displayed.width / natural.width
        const imageLeft = (box.width - displayed.width) / 2 + offset.x
        const imageTop = (box.height - displayed.height) / 2 + offset.y
        const windowLeft = (box.width - crop.width) / 2
        const windowTop = (box.height - crop.height) / 2

        const sx = (windowLeft - imageLeft) / perPixel
        const sy = (windowTop - imageTop) / perPixel
        const sw = crop.width / perPixel
        const sh = crop.height / perPixel

        const outWidth = Math.max(1, Math.round(outputWidth ?? sw))
        const outHeight = Math.max(1, Math.round((outWidth * sh) / sw))

        canvas.width = outWidth
        canvas.height = outHeight
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outWidth, outHeight)

        return canvas.toDataURL(type, quality)
      },
      [
        box.height,
        box.width,
        crop.height,
        crop.width,
        natural.width,
        displayed.height,
        displayed.width,
        offset.x,
        offset.y,
        outputWidth,
      ]
    )

    React.useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          setZoom(defaultZoom)
          setOffset({ x: 0, y: 0 })
        },
        toDataURL: exportDataURL,
      }),
      [defaultZoom, setZoom, exportDataURL]
    )

    const moveBy = (dx: number, dy: number) =>
      setOffset((current) => settle({ x: current.x + dx, y: current.y + dy }))

    return (
      <div className={cn('w-full', className)} {...props}>
        <div
          ref={containerRef}
          data-shape={shape}
          className="relative w-full overflow-hidden rounded-md border border-border bg-muted"
          style={{ height }}
        >
          <img
            ref={imageRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={(event) => {
              const image = event.currentTarget
              setNatural({ width: image.naturalWidth, height: image.naturalHeight })
            }}
            className="absolute select-none touch-none"
            style={{
              width: displayed.width || undefined,
              height: displayed.height || undefined,
              left: (box.width - displayed.width) / 2 + offset.x,
              top: (box.height - displayed.height) / 2 + offset.y,
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              panning.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerMove={(event) => {
              if (!panning.current) return
              moveBy(event.clientX - panning.current.x, event.clientY - panning.current.y)
              panning.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerUp={() => {
              panning.current = null
            }}
            onPointerCancel={() => {
              panning.current = null
            }}
          />

          {crop.width > 0 && (
            <>
              {/* Four bands rather than one masked shape: it keeps the maths
                  visible, and the crop window can be round without a mask. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bg-background/70"
                style={{ left: 0, top: 0, width: '100%', height: Math.max(0, (box.height - crop.height) / 2) }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bg-background/70"
                style={{
                  left: 0,
                  top: (box.height + crop.height) / 2,
                  width: '100%',
                  height: Math.max(0, (box.height - crop.height) / 2),
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bg-background/70"
                style={{
                  left: 0,
                  top: Math.max(0, (box.height - crop.height) / 2),
                  width: Math.max(0, (box.width - crop.width) / 2),
                  height: crop.height,
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bg-background/70"
                style={{
                  left: (box.width + crop.width) / 2,
                  top: Math.max(0, (box.height - crop.height) / 2),
                  width: Math.max(0, (box.width - crop.width) / 2),
                  height: crop.height,
                }}
              />

              <div
                data-crop-window
                className={cn(
                  'pointer-events-none absolute border-2 border-background',
                  shape === 'circle' && 'rounded-full'
                )}
                style={{
                  left: (box.width - crop.width) / 2,
                  top: (box.height - crop.height) / 2,
                  width: crop.width,
                  height: crop.height,
                }}
              >
                {showGrid && (
                  <div className="absolute inset-0">
                    <span className="absolute left-1/3 top-0 h-full w-px bg-background/60" />
                    <span className="absolute left-2/3 top-0 h-full w-px bg-background/60" />
                    <span className="absolute left-0 top-1/3 h-px w-full bg-background/60" />
                    <span className="absolute left-0 top-2/3 h-px w-full bg-background/60" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showControls && (
          <div className="mt-3 flex items-center gap-3">
            <Slider
              aria-label="Zoom"
              value={[currentZoom]}
              min={minZoom}
              max={maxZoom}
              step={0.01}
              className="w-40"
              onValueChange={(next) => {
                setZoom(next[0])
                setOffset((current) => settle(current))
              }}
            />
            <span className="w-12 text-xs tabular-nums text-muted-foreground">
              {Math.round(currentZoom * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoom(defaultZoom)
                setOffset({ x: 0, y: 0 })
              }}
            >
              <RefreshIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {resetLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              className="ml-auto"
              onClick={() => onCrop?.(exportDataURL())}
              disabled={!onCrop}
            >
              {cropLabel}
            </Button>
          </div>
        )}
      </div>
    )
  }
)
Cropper.displayName = 'Cropper'

export { Cropper }
