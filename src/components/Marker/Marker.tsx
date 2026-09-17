import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const markerVariants = cva('flex w-full items-center text-xs', {
  variants: {
    variant: {
      /** Label between two hairlines — a date break in a stream. */
      line: 'gap-3',
      /** A centred pill on its own — "New messages", "Session started". */
      pill: 'justify-center',
      /** A dashed rule with no label — a quiet boundary. */
      dot: 'justify-center',
    },
  },
  defaultVariants: { variant: 'line' },
})

const markerToneVariants = cva('', {
  variants: {
    tone: {
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
      primary: 'text-primary',
      success: 'text-success',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: { tone: 'muted' },
})

const ruleVariants = cva('h-px flex-1', {
  variants: {
    tone: {
      muted: 'bg-border',
      accent: 'bg-accent',
      primary: 'bg-primary/30',
      success: 'bg-success/30',
      destructive: 'bg-destructive/30',
    },
  },
  defaultVariants: { tone: 'muted' },
})

export interface MarkerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof markerVariants>,
    VariantProps<typeof markerToneVariants> {
  children?: React.ReactNode
}

/**
 * A break in a stream — a date divider, "unread", a session boundary.
 *
 * `role="separator"` is what makes it more than decoration: a screen reader
 * announces a boundary instead of reading the label as the next message.
 * `variant="dot"` carries no label, so that one is `aria-hidden` instead — a
 * separator with no accessible name is noise.
 *
 * ```tsx
 * <Marker>Today</Marker>
 * <Marker variant="pill" tone="primary">New messages</Marker>
 * <Marker variant="dot" tone="destructive" />
 * ```
 */
const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, variant = 'line', tone, children, ...props }, ref) => {
    // The dashed rule has no background to tint, so it takes the tone through
    // `border-current` — one mapping instead of a second class table.
    const dashed = 'h-0 w-full border-t border-dashed border-current opacity-60'

    return (
      <div
        ref={ref}
        {...(variant === 'dot' ? { 'aria-hidden': true } : { role: 'separator' })}
        className={cn(markerVariants({ variant }), markerToneVariants({ tone }), className)}
        {...props}
      >
        {variant === 'line' && <span aria-hidden className={ruleVariants({ tone })} />}
        {variant === 'dot' && <span aria-hidden className={dashed} />}
        {variant !== 'dot' && children != null && (
          <span
            className={cn(
              'shrink-0',
              variant === 'pill' &&
                'rounded-full border border-border bg-background px-2.5 py-0.5 font-medium'
            )}
          >
            {children}
          </span>
        )}
        {variant === 'line' && <span aria-hidden className={ruleVariants({ tone })} />}
      </div>
    )
  }
)
Marker.displayName = 'Marker'

export { Marker }
