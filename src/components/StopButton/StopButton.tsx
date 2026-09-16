import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '../Button'
import { StopIcon } from '@/lib/icons'

export interface StopButtonProps
  extends Omit<ButtonProps, 'children' | 'loading'> {
  /** Visible label next to the icon. Icon-only when omitted. */
  label?: string
}

/** Cancels an in-flight generation. Icon-only by default. */
const StopButton = React.forwardRef<HTMLButtonElement, StopButtonProps>(
  ({ className, label, variant = 'outline', size, ...props }, ref) => {
    const resolvedSize = size ?? (label ? 'sm' : 'icon')

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size={resolvedSize}
        aria-label={label ?? 'Stop generating'}
        className={cn(resolvedSize === 'icon' && 'h-9 w-9', className)}
        {...props}
      >
        <StopIcon className="h-4 w-4 shrink-0" />
        {label ? <span>{label}</span> : null}
      </Button>
    )
  }
)
StopButton.displayName = 'StopButton'

export { StopButton }
