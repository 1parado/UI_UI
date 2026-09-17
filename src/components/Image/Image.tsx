import * as React from 'react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/Dialog'
import { AlertTriangleIcon } from '@/lib/icons'

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
export type ImageStatus = 'loading' | 'loaded' | 'error'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Kept required: a decorative picture is a different component's job. */
  alt: string
  /**
   * Stretch to the parent box instead of taking the file's own size. Needs a
   * positioned parent — the component supplies the rest.
   */
  fill?: boolean
  fit?: ImageFit
  /**
   * `loading="lazy"`. On by default, because most pictures in a page sit below
   * the fold; switch it off for anything above it, since deferring those makes
   * the page slower to look finished.
   */
  lazy?: boolean
  /** Click to open the zoomable preview. */
  preview?: boolean
  /** A larger file for the preview, leaving `src` as the thumbnail. */
  previewSrc?: string
  /** Shown while loading, replacing nothing by default. */
  placeholder?: React.ReactNode
  /** Shown when the file cannot load. */
  fallback?: React.ReactNode
  minZoom?: number
  maxZoom?: number
  /** How much one zoom step moves. */
  zoomStep?: number
  /** Turn off wheel zoom inside the preview. */
  disableWheelZoom?: boolean
}

const FITS: Record<ImageFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
}

function ImagePreview({
  src,
  alt,
  minZoom,
  maxZoom,
  zoomStep,
  disableWheelZoom,
}: {
  src: string
  alt: string
  minZoom: number
  maxZoom: number
  zoomStep: number
  disableWheelZoom: boolean
}) {
  const [scale, setScale] = React.useState(1)

  // React attaches `wheel` passively, so `preventDefault` there is ignored and
  // the page scrolls behind the preview. Listening directly is what makes
  // zooming possible without the page running away underneath it.
  React.useEffect(() => {
    if (disableWheelZoom) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const factor = event.deltaY < 0 ? 1 + zoomStep : 1 - zoomStep
      setScale((current) => Math.min(maxZoom, Math.max(minZoom, current * factor)))
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [disableWheelZoom, zoomStep, minZoom, maxZoom])

  return (
    <div
      className="flex h-full w-full flex-col"
      onKeyDown={(event) => {
        if (event.key === '+' || event.key === '=') setScale((current) => Math.min(maxZoom, current + zoomStep))
        if (event.key === '-') setScale((current) => Math.max(minZoom, current - zoomStep))
        if (event.key === '0') setScale(1)
      }}
    >
      {/* The picture is the content; the title only has to exist for AT. */}
      <DialogHeader className="sr-only">
        <DialogTitle>{alt}</DialogTitle>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        <img
          src={src}
          alt={alt}
          data-zoom={scale.toFixed(2)}
          style={{ transform: `scale(${scale})` }}
          className="max-h-full max-w-full origin-center transition-transform"
        />
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border p-3">
        <ToolbarButton label="Zoom out" onClick={() => setScale((current) => Math.max(minZoom, current - zoomStep))}>
          −
        </ToolbarButton>
        <span className="w-14 text-center text-sm tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <ToolbarButton label="Zoom in" onClick={() => setScale((current) => Math.min(maxZoom, current + zoomStep))}>
          +
        </ToolbarButton>
        <ToolbarButton label="Reset zoom" onClick={() => setScale(1)}>
          Reset
        </ToolbarButton>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-input bg-background px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}

/**
 * An `<img>` that knows what it is for.
 *
 * Four things a bare `<img>` leaves to the caller, done here: defer off-screen
 * work (`lazy`), hold the layout while loading (`fill`, `width`/`height`),
 * fail gracefully (`fallback`), and open a zoomable preview on click.
 * Everything else stays a plain image attribute, so `srcSet`, `sizes` and
 * `decoding` pass straight through.
 *
 * The preview runs at `maxZoom` × in steps of `zoomStep`, from the wheel, the
 * buttons, or `+` / `-` / `0` on the keyboard.
 *
 * ```tsx
 * <Image src={thumb} previewSrc={full} alt="Desk setup" width={640} height={480} />
 * ```
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      fill = false,
      fit = 'cover',
      lazy = true,
      preview = false,
      previewSrc,
      placeholder,
      fallback,
      minZoom = 0.25,
      maxZoom = 4,
      zoomStep = 0.25,
      disableWheelZoom = false,
      className,
      style,
      onLoad,
      onError,
      onClick,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = React.useState<ImageStatus>('loading')
    const [open, setOpen] = React.useState(false)

    if (status === 'error') {
      return (
        <div
          data-status="error"
          className={cn(
            'flex items-center justify-center gap-2 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground',
            className
          )}
          style={style}
        >
          {fallback ?? (
            <>
              <AlertTriangleIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{alt} could not be loaded</span>
            </>
          )}
        </div>
      )
    }

    return (
      <>
        <span
          data-status={status}
          className={cn('relative inline-flex overflow-hidden', fill && 'h-full w-full')}
          style={style}
        >
          <img
            ref={ref}
            src={src}
            alt={alt}
            data-loaded={status === 'loaded'}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            onLoad={(event) => {
              setStatus('loaded')
              onLoad?.(event)
            }}
            onError={(event) => {
              setStatus('error')
              onError?.(event)
            }}
            onClick={(event) => {
              onClick?.(event)
              if (preview) setOpen(true)
            }}
            className={cn(
              'transition-opacity',
              status === 'loading' ? 'opacity-0' : 'opacity-100',
              fill
                ? cn('absolute inset-0 h-full w-full', FITS[fit])
                : cn('max-w-full', FITS[fit]),
              preview && status === 'loaded' && 'cursor-zoom-in',
              className
            )}
            {...props}
          />

          {status === 'loading' && placeholder && (
            <span className="absolute inset-0 flex items-center justify-center">{placeholder}</span>
          )}
        </span>

        {preview && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex h-[90vh] max-w-5xl flex-col p-0">
              <ImagePreview
                src={previewSrc ?? src ?? ''}
                alt={alt}
                minZoom={minZoom}
                maxZoom={maxZoom}
                zoomStep={zoomStep}
                disableWheelZoom={disableWheelZoom}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }
)
Image.displayName = 'Image'

export { Image }
