import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from '@/lib/icons'

const nativeSelectVariants = cva(
  'w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      selectSize: {
        sm: 'h-8 text-xs',
        default: 'h-10 text-sm',
        lg: 'h-11 text-base',
      },
    },
    defaultVariants: {
      selectSize: 'default',
    },
  }
)

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof nativeSelectVariants> {
  /**
   * Renders error styling and `aria-invalid`, matching `Input`.
   */
  invalid?: boolean
  /** Applied to the wrapper that holds the chevron, not to the `select`. */
  containerClassName?: string
}

/**
 * The platform `<select>`, styled to sit beside `Input` and `Textarea`.
 *
 * This is deliberately **not** a replacement for `Select`. The two solve
 * different problems:
 *
 * - `Select` (Radix) is a listbox you control — option rows can hold icons,
 *   descriptions and badges, and it can be searched.
 * - `NativeSelect` hands the choice to the OS. On touch devices that means the
 *   native wheel/action sheet, which is what a form on a phone wants; it also
 *   participates in native form submission and `FormData` without JavaScript.
 *
 * The size variant is `selectSize`, not `size`: the DOM attribute of that name
 * already means "how many rows to show" and is a number, so shadowing it with
 * `'sm' | 'lg'` would quietly break `size={4}`. Both can be passed at once.
 *
 * ```tsx
 * <NativeSelect defaultValue="eu" aria-label="Region">
 *   <option value="us">United States</option>
 *   <optgroup label="Europe">
 *     <option value="eu">European Union</option>
 *   </optgroup>
 * </NativeSelect>
 * ```
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, containerClassName, selectSize, invalid = false, children, ...props }, ref) => {
    // Pulled out of `props` rather than read off it: spreading `props` after the
    // attribute would put an explicit `aria-invalid={false}` back on the DOM.
    const { 'aria-invalid': ariaInvalidProp, ...rest } = props
    const ariaInvalid = ariaInvalidProp !== undefined ? Boolean(ariaInvalidProp) : invalid

    return (
      <div className={cn('relative', containerClassName)}>
        <select
          ref={ref}
          className={cn(
            nativeSelectVariants({ selectSize }),
            ariaInvalid && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...rest}
          aria-invalid={ariaInvalid || undefined}
        >
          {children}
        </select>
        <ChevronDownIcon
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
