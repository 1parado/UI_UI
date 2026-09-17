import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@/lib/icons'

export type StepperState = 'completed' | 'current' | 'upcoming' | 'error'

const stepperMarkerVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors [&>svg]:size-4',
  {
    variants: {
      state: {
        completed: 'border-primary bg-primary text-primary-foreground',
        current: 'border-primary bg-background text-primary',
        upcoming: 'border-border bg-background text-muted-foreground',
        error: 'border-destructive bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      state: 'upcoming',
    },
  }
)

const stepperLabelVariants = cva('text-sm font-medium', {
  variants: {
    state: {
      completed: 'text-foreground',
      current: 'text-foreground',
      upcoming: 'text-muted-foreground',
      error: 'text-destructive',
    },
  },
  defaultVariants: {
    state: 'upcoming',
  },
})

type StepperOrientation = 'horizontal' | 'vertical'

const StepperContext = React.createContext<{
  current: number
  orientation: StepperOrientation
}>({ current: 0, orientation: 'horizontal' })

export interface StepperProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** Zero-based index of the step the user is on. */
  current?: number
  orientation?: StepperOrientation
}

/**
 * Progress through a multi-step flow — onboarding, checkout, a connection
 * wizard.
 *
 * `Stepper` walks its children to work out each one's position, so
 * `StepperItem` needs no index of its own; adding or reordering steps is a pure
 * markup change.
 *
 * ```tsx
 * <Stepper current={1}>
 *   <StepperItem title="Account" description="Email and password" />
 *   <StepperItem title="Workspace" description="Name and region" />
 *   <StepperItem title="Invite" />
 * </Stepper>
 * ```
 */
const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  ({ className, current = 0, orientation = 'horizontal', children, ...props }, ref) => {
    const items = React.Children.toArray(children)

    return (
      <ol
        ref={ref}
        data-slot="stepper"
        data-orientation={orientation}
        className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        {...props}
      >
        <StepperContext.Provider value={{ current, orientation }}>
          {items.map((child, index) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<StepperItemProps>, {
                  index,
                  last: index === items.length - 1,
                })
              : child
          )}
        </StepperContext.Provider>
      </ol>
    )
  }
)
Stepper.displayName = 'Stepper'

export interface StepperItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title?: React.ReactNode
  /** Second line under the title — what this step asks for. */
  description?: React.ReactNode
  /** Force a state instead of deriving it from the parent's `current`. */
  status?: StepperState
  /** Replaces the number or tick in the marker. */
  icon?: React.ReactNode
  /** Position within the parent `Stepper`. Injected — do not pass. */
  index?: number
  /** Whether this is the final step. Injected — do not pass. */
  last?: boolean
}

const StepperItem = React.forwardRef<HTMLLIElement, StepperItemProps>(
  ({ className, title, description, status, icon, index = 0, last = false, ...props }, ref) => {
    const { current, orientation } = React.useContext(StepperContext)
    const horizontal = orientation === 'horizontal'

    const state: StepperState =
      status ?? (index < current ? 'completed' : index === current ? 'current' : 'upcoming')

    const label = title && (
      <span className={cn(stepperLabelVariants({ state }))}>
        {title}
        {state === 'current' && <span className="sr-only"> (current step)</span>}
      </span>
    )

    return (
      <li
        ref={ref}
        data-slot="stepper-item"
        data-state={state}
        aria-current={state === 'current' ? 'step' : undefined}
        className={cn(
          'min-w-0',
          horizontal ? 'flex flex-1 flex-col' : 'flex gap-3',
          className
        )}
        {...props}
      >
        <div className={cn(horizontal ? 'flex items-center' : 'flex flex-col items-center')}>
          <span className={cn(stepperMarkerVariants({ state }))}>
            {icon ?? (state === 'completed' ? <CheckIcon /> : index + 1)}
          </span>
          {!last && (
            <span
              aria-hidden
              className={cn(
                horizontal ? 'ml-2 h-px flex-1' : 'mt-1 w-px flex-1',
                state === 'completed' ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <div
          className={cn(
            'flex min-w-0 flex-col gap-0.5',
            horizontal ? 'pr-4 pt-2' : 'flex-1 pb-6'
          )}
        >
          {label}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </li>
    )
  }
)
StepperItem.displayName = 'StepperItem'

export { Stepper, StepperItem }
