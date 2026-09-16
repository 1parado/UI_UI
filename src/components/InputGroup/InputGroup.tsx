import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Input with slots around it. The border and focus ring live on the group, so
 * icons, prefixes and buttons sit inside one hit area — instead of absolutely
 * positioned over a plain `Input`.
 */
export type InputGroupProps = React.ComponentPropsWithoutRef<'div'>

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
        className
      )}
      {...props}
    />
  )
)
InputGroup.displayName = 'InputGroup'

export type InputGroupInputProps = React.ComponentPropsWithoutRef<'input'>

/** Borderless input that fills the remaining space in an `InputGroup`. */
const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)
InputGroupInput.displayName = 'InputGroupInput'

const addonVariants = cva(
  'flex shrink-0 items-center gap-1 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
  {
    variants: {
      align: {
        'inline-start': '',
        'inline-end': 'ml-auto',
      },
    },
    defaultVariants: { align: 'inline-start' },
  }
)

export interface InputGroupAddonProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof addonVariants> {}

/** Decorates an edge of the group: an icon, a `Kbd`, a unit of measure. */
const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(addonVariants({ align }), className)}
      {...props}
    />
  )
)
InputGroupAddon.displayName = 'InputGroupAddon'

export type InputGroupTextProps = React.ComponentPropsWithoutRef<'span'>

/** Static text inside the group — a scheme prefix, a domain suffix. */
const InputGroupText = ({ className, ...props }: InputGroupTextProps) => (
  <span
    className={cn('shrink-0 text-sm text-muted-foreground', className)}
    {...props}
  />
)
InputGroupText.displayName = 'InputGroupText'

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText, addonVariants }
