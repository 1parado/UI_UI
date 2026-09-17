import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircleIcon, CheckCheckIcon, CheckIcon, ClockIcon } from '@/lib/icons'

export type BubbleSide = 'in' | 'out'
export type BubbleStatus = 'sending' | 'sent' | 'read' | 'error'

const bubbleVariants = cva(
  'relative w-fit max-w-[min(80%,42rem)] break-words px-3.5 py-2 text-sm',
  {
    variants: {
      side: {
        in: 'mr-auto rounded-2xl bg-muted text-foreground',
        out: 'ml-auto rounded-2xl bg-primary text-primary-foreground',
      },
      tail: { true: '', false: '' },
      size: {
        default: 'text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2.5 text-base',
      },
    },
    compoundVariants: [
      // A tail squares off the corner it points from; without one the bubble is
      // fully rounded, which is what a middle-of-a-run bubble looks like.
      { side: 'in', tail: true, class: 'rounded-bl-sm' },
      { side: 'out', tail: true, class: 'rounded-br-sm' },
    ],
    defaultVariants: { side: 'in', tail: false, size: 'default' },
  }
)

const tailVariants = cva('absolute bottom-0 size-2 rotate-45 rounded-[1px]', {
  variants: {
    side: {
      in: '-left-0.5 bg-muted',
      out: '-right-0.5 bg-primary',
    },
  },
  defaultVariants: { side: 'in' },
})

const metaVariants = cva('mt-0.5 flex items-center gap-1 text-[11px] leading-none', {
  variants: {
    side: {
      in: 'justify-start text-muted-foreground',
      out: 'justify-end text-primary-foreground/70',
    },
  },
  defaultVariants: { side: 'in' },
})

const statusIcons: Record<BubbleStatus, React.ComponentType<{ className?: string }>> = {
  sending: ClockIcon,
  sent: CheckIcon,
  read: CheckCheckIcon,
  error: AlertCircleIcon,
}

export interface BubbleLabels {
  sending?: string
  sent?: string
  read?: string
  error?: string
}

const defaultLabels: Required<BubbleLabels> = {
  sending: 'Sending',
  sent: 'Sent',
  read: 'Read',
  error: 'Not sent',
}

export interface BubbleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof bubbleVariants> {
  /** Which end of the thread this bubble sits on. */
  side?: BubbleSide
  /** Draws the corner spike. Use it on the last bubble of a run only. */
  tail?: boolean
  /** Delivery state, shown as an icon beside `meta`. */
  status?: BubbleStatus
  /** Timestamp or short caption on the meta line. */
  meta?: React.ReactNode
  children?: React.ReactNode
  labels?: BubbleLabels
}

/**
 * The bubble shell of a chat turn — compact, side-aligned, with delivery state.
 *
 * Sits below `Message`, which is the *document* treatment: an avatar, a role,
 * markdown, tool calls, an action row. A bubble has none of that — it is what
 * you reach for in a small widget, a support inbox, or an SMS-like surface
 * where a reply is a paragraph at most.
 *
 * `BubbleGroup` is the pairing that matters: a run of bubbles from one side
 * reads as one turn, so only the last one carries a tail and the gaps between
 * them are tighter than the gap between turns.
 *
 * ```tsx
 * <BubbleGroup side="out">
 *   <Bubble side="out">On my way</Bubble>
 *   <Bubble side="out" tail status="read" meta="09:20">Two minutes</Bubble>
 * </BubbleGroup>
 * ```
 */
const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  (
    { className, side = 'in', tail = false, size, status, meta, labels, children, ...props },
    ref
  ) => {
    const text = { ...defaultLabels, ...labels }
    const StatusIcon = status ? statusIcons[status] : null

    return (
      <div
        ref={ref}
        data-slot="bubble"
        data-side={side}
        data-status={status}
        className={cn(bubbleVariants({ side, tail, size }), className)}
        {...props}
      >
        {tail && <span aria-hidden className={tailVariants({ side })} />}
        <div>{children}</div>
        {(status || meta) && (
          <div data-slot="bubble-meta" className={cn(metaVariants({ side }))}>
            {meta}
            {StatusIcon && (
              <span role="img" aria-label={text[status!]}>
                <StatusIcon className="size-3" />
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Bubble.displayName = 'Bubble'

export interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: BubbleSide
}

/** A run of bubbles from one side. Tighter inside, roomier between turns. */
const BubbleGroup = React.forwardRef<HTMLDivElement, BubbleGroupProps>(
  ({ className, side, ...props }, ref) => (
    <div
      ref={ref}
      data-side={side}
      className={cn('flex w-full flex-col gap-1', className)}
      {...props}
    />
  )
)
BubbleGroup.displayName = 'BubbleGroup'

export type BubbleMetaProps = React.HTMLAttributes<HTMLSpanElement>

/** Standalone meta line, for bubbles that keep their caption outside the shell. */
const BubbleMeta = React.forwardRef<HTMLSpanElement, BubbleMetaProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-[11px] leading-none text-muted-foreground', className)}
      {...props}
    />
  )
)
BubbleMeta.displayName = 'BubbleMeta'

export { Bubble, BubbleGroup, BubbleMeta }
