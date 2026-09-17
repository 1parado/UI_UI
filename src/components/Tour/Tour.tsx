import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn } from '@/lib/utils'
import {
  type Rect,
  type Size,
  type TourPlacement,
  centreCard,
  maskRects,
  placeCard,
  spotlightRect,
} from '@/lib/tour'
import { XIcon } from '@/lib/icons'
import { useControllableState } from '@/lib/use-controllable-state'

export interface TourStep {
  /** A selector, an element, or something that answers with one. */
  target: string | HTMLElement | (() => HTMLElement | null)
  title: React.ReactNode
  content: React.ReactNode
  /** Which side is preferred; it flips when there is no room. */
  placement?: TourPlacement
}

export interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: TourStep[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The last step's button was pressed, not skipped. */
  onFinish?: () => void
  onStepChange?: (index: number) => void
  /** Padding between the spotlight and the element it frames. */
  spotlightPadding?: number
  /** Distance between the spotlight and the card. */
  gap?: number
  /** Tapping the darkened area ends the tour. */
  closeOnMaskClick?: boolean
  nextLabel?: string
  prevLabel?: string
  finishLabel?: string
}

function resolveTarget(step: TourStep | undefined): HTMLElement | null {
  if (!step) return null

  if (typeof step.target === 'function') return step.target()
  if (typeof step.target === 'string') {
    return document.querySelector<HTMLElement>(step.target)
  }

  return step.target
}

/**
 * A walk through the page, one element at a time.
 *
 * Two things make this more than a dialog: an element is *pointed at* rather
 * than described, and the rest of the page is still there behind it. So the
 * component measures the target, frames it with four dark bands (four rather
 * than one cut-out shape, so "tap anywhere to dismiss" has something to click),
 * and puts the card on whichever side has room — flipping rather than hanging
 * the card off the edge of the screen. See `lib/tour` for the arithmetic.
 *
 * Steps with no resolvable element are centred instead of skipped: a tour that
 * silently drops a step leaves its author wondering where it went.
 *
 * ```tsx
 * <Tour open={showTour} onOpenChange={setShowTour} steps={[
 *   { target: '#save', title: 'Save', content: 'Ctrl+S works here too.' },
 * ]} />
 * ```
 */
const Tour: React.FC<TourProps> = ({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  onFinish,
  onStepChange,
  spotlightPadding = 8,
  gap = 12,
  closeOnMaskClick = true,
  nextLabel = 'Next',
  prevLabel = 'Back',
  finishLabel = 'Finish',
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  })

  const [index, setIndex] = React.useState(0)
  const [hole, setHole] = React.useState<Rect | null>(null)
  const [cardSize, setCardSize] = React.useState<Size>({ width: 320, height: 180 })
  const cardRef = React.useRef<HTMLDivElement>(null)
  const restoreFocusTo = React.useRef<HTMLElement | null>(null)

  const step = steps[index]
  const last = steps.length - 1

  const go = (next: number) => {
    const clamped = Math.min(last, Math.max(0, next))
    setIndex(clamped)
    onStepChange?.(clamped)
  }

  const close = () => setIsOpen(false)

  // Take the keyboard before opening, and give it back afterwards — a tour
  // that leaves focus on the body loses its Escape key.
  React.useEffect(() => {
    if (!isOpen) return

    restoreFocusTo.current = document.activeElement as HTMLElement | null
    return () => restoreFocusTo.current?.focus?.()
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return
    // Focus follows the step, so Enter and the arrow keys act on the step the
    // user is reading rather than whatever was behind the overlay.
    cardRef.current?.focus()
  }, [isOpen, index])

  React.useEffect(() => {
    if (!isOpen) return

    const measure = () => {
      const element = resolveTarget(step)
      if (!element) {
        setHole(null)
        return
      }

      const box = element.getBoundingClientRect()
      setHole({ top: box.top, left: box.left, width: box.width, height: box.height })
    }

    resolveTarget(step)?.scrollIntoView?.({ block: 'center', inline: 'center' })
    measure()

    // Anything that moves the target under the overlay has to be re-measured:
    // scrolling, resizing, and the reflow following an animation.
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [isOpen, step])

  // The card decides where it goes from its own measured size, which changes
  // with each step's copy — so it is measured after every step, not once.
  React.useLayoutEffect(() => {
    if (!isOpen || !cardRef.current) return

    const box = cardRef.current.getBoundingClientRect()
    if (box.width === 0 && box.height === 0) return

    setCardSize((current) =>
      current.width === box.width && current.height === box.height
        ? current
        : { width: box.width, height: box.height }
    )
  }, [isOpen, index])

  if (!isOpen || steps.length === 0) return null

  const viewport: Size =
    typeof window === 'undefined'
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight }

  const spotlight = hole ? spotlightRect(hole, spotlightPadding) : null
  const position = spotlight
    ? placeCard(spotlight, cardSize, viewport, { placement: step?.placement, gap })
    : null
  const centred = centreCard(cardSize, viewport)
  const top = position?.top ?? centred.top
  const left = position?.left ?? centred.left

  return ReactDOM.createPortal(
    <div
      data-placement={position?.placement ?? 'center'}
      className={cn('fixed inset-0 z-50', className)}
      {...props}
    >
      {spotlight && (
        <>
          {maskRects(spotlight, viewport).map((band, bandIndex) => (
            <div
              key={bandIndex}
              aria-hidden="true"
              onPointerDown={() => closeOnMaskClick && close()}
              className="absolute bg-foreground/50"
              style={{ top: band.top, left: band.left, width: band.width, height: band.height }}
            />
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-md ring-2 ring-background"
            style={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }}
          />
        </>
      )}

      {!spotlight && (
        <div
          aria-hidden="true"
          onPointerDown={() => closeOnMaskClick && close()}
          className="absolute inset-0 bg-foreground/50"
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof step?.title === 'string' ? step.title : 'Guided tour'}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
          if (event.key === 'ArrowRight') go(index + 1)
          if (event.key === 'ArrowLeft') go(index - 1)
        }}
        className="absolute w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none"
        style={{ top, left }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold">{step?.title}</h3>
          <button
            type="button"
            aria-label="End tour"
            onClick={close}
            className="rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground">{step?.content}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {index + 1} / {steps.length}
          </span>

          <div className="flex items-center gap-2">
            <TourButton label={prevLabel} onClick={() => go(index - 1)} disabled={index === 0}>
              {prevLabel}
            </TourButton>
            {index === last ? (
              <TourButton
                label={finishLabel}
                onClick={() => {
                  onFinish?.()
                  close()
                }}
                primary
              >
                {finishLabel}
              </TourButton>
            ) : (
              <TourButton label={nextLabel} onClick={() => go(index + 1)} primary>
                {nextLabel}
              </TourButton>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
Tour.displayName = 'Tour'

function TourButton({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-md border border-input px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40',
        primary
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-background hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}

export { Tour }
