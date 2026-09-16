import * as React from 'react'
import { cn } from '@/lib/utils'

export type KbdProps = React.ComponentPropsWithoutRef<'kbd'>

/**
 * A single keyboard key. Drop several inside `KbdGroup` to show a shortcut —
 * `⌘` `K` rather than the string "⌘K".
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex h-5 min-w-5 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[0.6875rem] font-medium leading-none text-muted-foreground',
        className
      )}
      {...props}
    />
  )
)
Kbd.displayName = 'Kbd'

export type KbdGroupProps = React.ComponentPropsWithoutRef<'span'>

/** Lays keys out in a row with a consistent gap. */
const KbdGroup = ({ className, ...props }: KbdGroupProps) => (
  <span
    className={cn('inline-flex items-center gap-1', className)}
    {...props}
  />
)
KbdGroup.displayName = 'KbdGroup'

export { Kbd, KbdGroup }
