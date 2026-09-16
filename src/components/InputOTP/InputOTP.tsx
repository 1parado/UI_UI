import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { cn } from '@/lib/utils'

/**
 * One-time-code entry. `input-otp` keeps a single real input behind the slots,
 * so paste, autofill from SMS and screen readers all behave. Pass a `pattern`
 * (`REGEXP_ONLY_DIGITS`) to restrict what can be typed.
 */
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

export type InputOTPGroupProps = React.ComponentPropsWithoutRef<'div'>

/** Groups adjacent slots so they share one rounded outline. */
const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center', className)} {...props} />
  )
)
InputOTPGroup.displayName = 'InputOTPGroup'

export interface InputOTPSlotProps
  extends React.ComponentPropsWithoutRef<'div'> {
  /** Zero-based position of this slot in the code. */
  index: number
}

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext)
    const slot = inputOTPContext.slots[index]

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
          slot?.isActive &&
            'z-10 ring-2 ring-ring ring-offset-2 ring-offset-background',
          className
        )}
        {...props}
      >
        {slot?.char}
        {slot?.hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-pulse bg-foreground motion-reduce:animate-none" />
          </div>
        )}
      </div>
    )
  }
)
InputOTPSlot.displayName = 'InputOTPSlot'

export type InputOTPSeparatorProps = React.ComponentPropsWithoutRef<'div'>

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  InputOTPSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-hidden="true"
    className={cn('text-muted-foreground', className)}
    {...props}
  >
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
    </svg>
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
