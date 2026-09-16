import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Joins buttons into a single control: one outer outline, shared height, no
 * doubled borders. Use it for segmented choices (alignment, view mode) and
 * attached actions (split buttons).
 *
 * The group styles its children rather than the children knowing about the
 * group, so any `Button`, `Toggle`, or `Select` works unmodified.
 *
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Day</Button>
 *   <Button variant="outline">Week</Button>
 * </ButtonGroup>
 * ```
 */
export const buttonGroupVariants = cva(
  'inline-flex w-fit items-stretch isolate [&>*]:focus-visible:z-10',
  {
    variants: {
      orientation: {
        // `-ml-px` folds neighbouring borders onto each other, so an outline
        // group reads as one box instead of two touching lines.
        horizontal:
          '[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          '[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  }
)

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
)
ButtonGroup.displayName = 'ButtonGroup'

export interface ButtonGroupSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Defaults to the opposite of the group's orientation. */
  orientation?: 'horizontal' | 'vertical'
}

/** Hairline rule between two members, so they can carry different intents. */
const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      'shrink-0 self-stretch bg-border',
      orientation === 'vertical' ? 'w-px' : 'h-px',
      className
    )}
    {...props}
  />
))
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator'

export { ButtonGroup, ButtonGroupSeparator }
