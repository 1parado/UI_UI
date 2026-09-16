import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { XIcon } from '@/lib/icons'

/**
 * Panel that slides in from an edge. Same modal semantics as `Dialog`
 * (focus trap, Escape to close, overlay) — pick it when the content is long or
 * needs to stay put while the page remains visible: settings, filters, details.
 */
const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetPortal = SheetPrimitive.Portal
const SheetClose = SheetPrimitive.Close

export type SheetOverlayProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Overlay
>

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  SheetOverlayProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 bg-background shadow-lg motion-reduce:animate-none',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:animate-slide-out-top data-[state=open]:animate-slide-in-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right sm:max-w-sm',
      },
    },
    defaultVariants: { side: 'right' },
  }
)

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /** Hide the built-in close button when the layout supplies its own. */
  hideClose?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', hideClose = false, className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), 'p-6', className)}
      {...props}
    >
      {children}
      {!hideClose && (
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>

const SheetHeader = ({ className, ...props }: SheetHeaderProps) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>

const SheetFooter = ({ className, ...props }: SheetFooterProps) => (
  <div
    className={cn(
      'mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

export type SheetTitleProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Title
>

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold tracking-tight', className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

export type SheetDescriptionProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Description
>

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
}
