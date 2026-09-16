import * as React from 'react'
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'
import { cn } from '@/lib/utils'

/**
 * Keeps a box at a fixed width-to-height ratio while it fills the available
 * width. Use it for media that must not jump when it loads — video embeds,
 * thumbnails, chart placeholders.
 *
 * The child is what gets positioned: put the image on `className`-less
 * `h-full w-full object-cover` and it will fit exactly. Rounding and overflow
 * are left to the consumer — a ratio box is layout, not decoration.
 */
export type AspectRatioProps = React.ComponentPropsWithoutRef<
  typeof AspectRatioPrimitive.Root
>

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    className={cn('relative', className)}
    {...props}
  />
))
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName

export { AspectRatio }
