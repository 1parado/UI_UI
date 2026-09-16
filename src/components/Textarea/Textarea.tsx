import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * Marks the textarea as invalid, rendering error styling and `aria-invalid`.
   * Can also be driven implicitly via `aria-invalid` on the textarea.
   */
  invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid = false, ...props }, ref) => {
    const ariaInvalid =
      props['aria-invalid'] !== undefined ? Boolean(props['aria-invalid']) : invalid

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
Textarea.displayName = 'Textarea'

export { Textarea }
