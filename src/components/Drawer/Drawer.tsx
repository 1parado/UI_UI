import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils'
import { XIcon } from '@/lib/icons'

/**
 * Bottom sheet with drag-to-dismiss, built on vaul. Same modal semantics as
 * `Dialog` and `Sheet`, but the panel is meant to be grabbed: pick it for
 * touch-first flows — filters, quick actions, mobile detail views.
 *
 * ```tsx
 * <Drawer>
 *   <DrawerTrigger asChild><Button>Open</Button></DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Move to project</DrawerTitle>
 *     </DrawerHeader>
 *   </DrawerContent>
 * </Drawer>
 * ```
 */
const Drawer = ({
  shouldScaleBackground = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

export type DrawerOverlayProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Overlay
>

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in motion-reduce:animate-none',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  /** Hide the built-in close button when the layout supplies its own. */
  hideClose?: boolean
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, hideClose = false, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[92vh] flex-col rounded-t-lg border-t bg-background',
        className
      )}
      {...props}
    >
      {/* The grab handle doubles as the drag target on touch. */}
      <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
      {children}
      {!hideClose && (
        <DrawerPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DrawerPrimitive.Close>
      )}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>

const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => (
  <div
    className={cn('flex flex-col gap-1.5 p-6 pb-2 text-center sm:text-left', className)}
    {...props}
  />
)
DrawerHeader.displayName = 'DrawerHeader'

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>

const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-6 pt-2', className)}
    {...props}
  />
)
DrawerFooter.displayName = 'DrawerFooter'

export type DrawerTitleProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Title
>

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold tracking-tight', className)}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Description
>

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
