import * as React from 'react'
import { cn } from '@/lib/utils'
import type { EmptyPreset } from '@/lib/empty'

export type EmptyIllustrationProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'name' | 'children'
> & {
  /** Which drawing to show. */
  name: EmptyPreset
  /**
   * Words for the drawing. Left out, the illustration stays decorative — the
   * title and description beside it already say what this is.
   */
  label?: string
}

/**
 * Line art for the situations an empty state usually stands in for.
 *
 * Drawn rather than imported so it takes the current text colour and costs no
 * network request, and kept in one file so the set stays visually consistent.
 */
const drawings: Record<EmptyPreset, React.ReactElement> = {
  inbox: (
    <>
      <path d="M14 38 L24 20 H72 L82 38 V54 a4 4 0 0 1 -4 4 H18 a4 4 0 0 1 -4 -4 Z" />
      <path d="M14 38 H38 l4 6 H54 l4 -6 H82" />
    </>
  ),
  search: (
    <>
      <circle cx="42" cy="26" r="12" />
      <path d="M51 35 L64 48" />
      <path d="M26 56 H52" />
      <path d="M26 50 H42" />
    </>
  ),
  error: (
    <>
      <path d="M48 14 L78 58 H18 Z" />
      <path d="M48 30 V42" />
      <path d="M48 50 h0.01" />
    </>
  ),
  folder: (
    <>
      <path d="M12 24 H34 l6 6 H84 V52 a4 4 0 0 1 -4 4 H16 a4 4 0 0 1 -4 -4 Z" />
      <path d="M12 34 H84" />
    </>
  ),
  image: (
    <>
      <rect x="14" y="16" width="70" height="40" rx="4" />
      <circle cx="31" cy="30" r="4" />
      <path d="M18 52 L38 32 L50 45 L60 34 L78 52" />
    </>
  ),
  cart: (
    <>
      <path d="M14 18 H28 l6 30 H70 l6 -22 H30" />
      <circle cx="36" cy="54" r="3" />
      <circle cx="64" cy="54" r="3" />
    </>
  ),
  chat: (
    <>
      <path d="M14 18 H50 a4 4 0 0 1 4 4 V38 a4 4 0 0 1 -4 4 H32 L22 50 V42 H18 a4 4 0 0 1 -4 -4 V22 a4 4 0 0 1 4 -4 Z" />
      <path d="M50 30 H80 a4 4 0 0 1 4 4 V48 a4 4 0 0 1 -4 4 H62 L54 58 V52 H50 Z" />
    </>
  ),
  notification: (
    <>
      <path d="M48 12 a6 6 0 0 1 6 6 V32 l7 10 H35 l7 -10 V18 a6 6 0 0 1 6 -6 Z" />
      <path d="M41 48 a7 7 0 0 0 14 0" />
      <path d="M30 20 a18 18 0 0 1 6 -9" />
      <path d="M66 20 a18 18 0 0 0 -6 -9" />
    </>
  ),
}

const EmptyIllustration = React.forwardRef<SVGSVGElement, EmptyIllustrationProps>(
  ({ name, label, className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 96 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-16 w-24 text-muted-foreground/60', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {drawings[name]}
    </svg>
  )
)
EmptyIllustration.displayName = 'EmptyIllustration'

export { EmptyIllustration }
