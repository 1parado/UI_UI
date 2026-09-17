import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AffixProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Pixels from the top of the scroll container to stick to. */
  offsetTop?: number
  /** Pixels from the bottom. Use this **or** `offsetTop`, not both. */
  offsetBottom?: number
  /** The scrolling element. Defaults to the window. */
  target?: () => Window | HTMLElement | null
  /** z-index of the pinned copy. */
  zIndex?: number
  /** Fires when the pinned state changes. */
  onChange?: (affixed: boolean) => void
  children: React.ReactNode
}

interface FixedBox {
  width: number
  height: number
  /** Distance from the container's left edge, so the pin does not jump sideways. */
  left: number
  /** `top` when pinning to the top, `bottom` when pinning to the bottom. */
  offset: number
}

/**
 * Pins its child once the page scrolls past it — a toolbar that should stay
 * reachable, a summary card beside a long form.
 *
 * The wrapper keeps the child's box while it is pinned, so **the surrounding
 * layout does not shift** the moment it detaches: that is the whole reason this
 * is a wrapper and not a `position: sticky` you could write yourself in one
 * line. `sticky` is usually the better answer, and you should reach for it
 * first — `Affix` is for the cases sticky cannot do: a container that is not
 * the scroll parent, an element that has to move into a portal-free fixed
 * layer, or a pin that should only engage after a threshold.
 *
 * ```tsx
 * <Affix offsetTop={64} onChange={setPinned}>
 *   <Toolbar />
 * </Affix>
 * ```
 */
const Affix = React.forwardRef<HTMLDivElement, AffixProps>(
  (
    {
      className,
      offsetTop,
      offsetBottom,
      target,
      zIndex = 10,
      onChange,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const placeholderRef = React.useRef<HTMLDivElement>(null)
    const [fixed, setFixed] = React.useState<FixedBox | null>(null)
    const lastAffixed = React.useRef(false)

    React.useEffect(() => {
      const node = placeholderRef.current
      if (!node) return

      const container = target?.() ?? window
      const scrollNode: HTMLElement | Window = container ?? window

      const measure = () => {
        const rect = node.getBoundingClientRect()

        // Without a layout engine every box is 0x0 and there is nothing to
        // decide — pinning on zeros would fire `onChange` on mount for no
        // visible reason.
        if (rect.width === 0 && rect.height === 0) return

        const viewportHeight =
          scrollNode === window
            ? window.innerHeight
            : (scrollNode as HTMLElement).clientHeight

        let next: FixedBox | null = null

        if (offsetBottom !== undefined) {
          const under = rect.bottom + offsetBottom - viewportHeight
          if (under > 0) {
            next = {
              width: rect.width,
              height: rect.height,
              left: rect.left,
              offset: offsetBottom,
            }
          }
        } else {
          const top = offsetTop ?? 0
          if (rect.top - top <= 0) {
            next = {
              width: rect.width,
              height: rect.height,
              left: rect.left,
              offset: top,
            }
          }
        }

        setFixed((previous) => {
          const same =
            previous === next ||
            (previous &&
              next &&
              previous.width === next.width &&
              previous.height === next.height &&
              previous.left === next.left &&
              previous.offset === next.offset)
          return same ? previous : next
        })

        // Reported here rather than from a `useEffect` on the state, so the
        // callback fires in the same tick as the scroll that caused it.
        const affixed = next !== null
        if (affixed !== lastAffixed.current) {
          lastAffixed.current = affixed
          onChange?.(affixed)
        }
      }

      measure()

      const element = scrollNode === window ? window : (scrollNode as HTMLElement)
      element.addEventListener('scroll', measure, { passive: true })
      element.addEventListener('resize', measure)
      window.addEventListener('resize', measure)

      return () => {
        element.removeEventListener('scroll', measure)
        element.removeEventListener('resize', measure)
        window.removeEventListener('resize', measure)
      }
    }, [offsetTop, offsetBottom, target, onChange])

    const affixed = fixed !== null

    return (
      <div
        ref={(node) => {
          placeholderRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        data-affixed={affixed || undefined}
        className={className}
        // While pinned the child leaves the flow, so the wrapper holds its box.
        style={
          affixed
            ? { width: fixed.width, height: fixed.height, ...style }
            : style
        }
        {...props}
      >
        <div
          className={cn(affixed && 'pointer-events-auto')}
          style={
            affixed
              ? {
                  position: 'fixed',
                  width: fixed.width,
                  height: fixed.height,
                  left: fixed.left,
                  ...(offsetBottom !== undefined
                    ? { bottom: fixed.offset }
                    : { top: fixed.offset }),
                  zIndex,
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    )
  }
)
Affix.displayName = 'Affix'

export { Affix }
