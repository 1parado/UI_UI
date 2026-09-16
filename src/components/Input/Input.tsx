import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /**
   * Marks the input as invalid, rendering error styling and `aria-invalid`.
   * Can also be driven implicitly via `aria-invalid` on the input.
   */
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid = false, ...props }, ref) => {
    const ariaInvalid =
      props['aria-invalid'] !== undefined ? Boolean(props['aria-invalid']) : invalid

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          ariaInvalid &&
            'border-destructive ring-destructive/20 focus-visible:ring-destructive',
          className
        )}
        aria-invalid={ariaInvalid || undefined}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
