import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from '@/lib/icons'

/**
 * A single disclosure region. Use this when one section toggles on its own;
 * reach for `Accordion` when several sections are mutually exclusive.
 */
const Collapsible = CollapsiblePrimitive.Root

export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Trigger
>

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ className, asChild, children, ...props }, ref) => {
  // `asChild` hands the trigger to a consumer element (usually `Button`).
  // Appending the chevron would give Radix's Slot two children and crash with
  // "Expected a single React element child" — so in that mode the consumer
  // owns the indicator and we pass the children through untouched.
  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      asChild={asChild}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-md text-left text-sm font-medium ring-offset-background transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none" />
        </>
      )}
    </CollapsiblePrimitive.Trigger>
  )
})
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

export type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
>

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none"
    {...props}
  >
    <div className={cn('pt-2 text-sm text-muted-foreground', className)}>
      {children}
    </div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
