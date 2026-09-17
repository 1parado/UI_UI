import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ArrowUpToLineIcon } from '@/lib/icons'

type FloatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const positionClassName: Record<FloatPosition, string> = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
}

const floatButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 rounded-full border border-border',
    'bg-background text-foreground shadow-lg transition-[transform,box-shadow,background-color]',
    'hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'size-9 text-sm',
        md: 'size-11 text-base',
        lg: 'size-14 text-lg',
      },
      variant: {
        default: '',
        primary: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
      },
      /** Renders as a pill when it carries a text label. */
      shape: { circle: '', pill: 'w-auto px-4' },
    },
    defaultVariants: { size: 'md', variant: 'default', shape: 'circle' },
  }
)

const FloatButtonGroupContext = React.createContext<{
  position: FloatPosition
  open: boolean
  /** False for the default value, so a loose button knows to pin itself. */
  inGroup: boolean
}>({ position: 'bottom-right', open: true, inGroup: false })

export interface FloatButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon?: React.ReactNode
  /** Text beside the icon. Turns the button into a pill. */
  label?: React.ReactNode
  /** Corner to pin to. Ignored inside a `FloatButtonGroup`. */
  position?: FloatPosition
  /**
   * Native tooltip text. A real `title` rather than the library's `Tooltip`:
   * the hover card on a floating action is decoration, and a native one still
   * shows up for keyboard and touch users.
   */
  tooltip?: string
  variant?: VariantProps<typeof floatButtonVariants>['variant']
  size?: VariantProps<typeof floatButtonVariants>['size']
}

/**
 * A floating action button.
 *
 * Pinned to a corner by default; inside a `FloatButtonGroup` the group owns the
 * corner and these stack against it. It is a plain `<button>`, so `onClick`,
 * `disabled` and `aria-*` behave the way they do everywhere else.
 *
 * ```tsx
 * <FloatButton icon={<PlusIcon />} tooltip="New document" onClick={create} />
 * ```
 */
const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
  (
    {
      className,
      icon,
      label,
      position,
      tooltip,
      variant,
      size,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const { inGroup } = React.useContext(FloatButtonGroupContext)

    return (
      <button
        ref={ref}
        type="button"
        // The label is the accessible name when there is one; otherwise the
        // caller's `aria-label` or the tooltip has to carry it.
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : tooltip)}
        title={tooltip}
        data-slot="float-button"
        className={cn(
          floatButtonVariants({
            size,
            variant,
            shape: label ? 'pill' : 'circle',
          }),
          !inGroup && 'fixed z-40',
          !inGroup && positionClassName[position ?? 'bottom-right'],
          className
        )}
        {...props}
      >
        {icon}
        {label && <span className="font-medium">{label}</span>}
      </button>
    )
  }
)
FloatButton.displayName = 'FloatButton'

export interface FloatButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  position?: FloatPosition
  /** Collapse to a single trigger until hovered or focused. */
  trigger?: 'hover' | 'click' | 'always'
  /** The trigger's own icon when collapsed. */
  icon?: React.ReactNode
  /** Accessible name for the collapsed trigger. */
  label?: string
}

/**
 * Stacks floating buttons against one corner, optionally collapsing them behind
 * a trigger until they are wanted.
 */
const FloatButtonGroup = React.forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (
    {
      className,
      position = 'bottom-right',
      trigger = 'always',
      icon,
      label = 'More actions',
      children,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(trigger === 'always')

    const hoverHandlers =
      trigger === 'hover'
        ? {
            onMouseEnter: () => setOpen(true),
            onMouseLeave: () => setOpen(false),
            onFocusCapture: () => setOpen(true),
            onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setOpen(false)
              }
            },
          }
        : {}

    const showTrigger = trigger !== 'always'

    return (
      <FloatButtonGroupContext.Provider value={{ position, open, inGroup: true }}>
        <div
          ref={ref}
          data-slot="float-button-group"
          className={cn(
            'fixed z-40 flex flex-col items-center gap-2',
            positionClassName[position],
            // A collapsed group still needs to be reachable, so the trigger
            // stays and only the rest fold away.
            position.startsWith('bottom') ? 'flex-col-reverse' : 'flex-col',
            className
          )}
          {...hoverHandlers}
          {...props}
        >
          {open && children}
          {showTrigger && (
            <FloatButton
              aria-expanded={open}
              aria-label={label}
              icon={icon ?? <ArrowUpToLineIcon aria-hidden className="size-4" />}
              onClick={
                trigger === 'click'
                  ? () => setOpen((previous) => !previous)
                  : undefined
              }
            />
          )}
        </div>
      </FloatButtonGroupContext.Provider>
    )
  }
)
FloatButtonGroup.displayName = 'FloatButtonGroup'

export interface BackTopProps extends Omit<FloatButtonProps, 'onClick'> {
  /** Show the button once the page has scrolled this far. */
  visibilityHeight?: number
  /** The scrolling element. Defaults to the window. */
  target?: () => Window | HTMLElement | null
  /** Accessible name. */
  label?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * A floating button that appears once you have scrolled away from the top and
 * takes you back.
 *
 * Hidden until it is useful: a "back to top" control on a page that is already
 * at the top is a button that does nothing. It is removed from the tab order
 * while hidden rather than merely faded, so a keyboard user does not land on
 * an invisible control.
 *
 * ```tsx
 * <BackTop visibilityHeight={400} />
 * ```
 */
const BackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (
    {
      className,
      visibilityHeight = 200,
      target,
      label = 'Back to top',
      icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      const scrollNode = target?.() ?? window
      const element = scrollNode === window ? window : (scrollNode as HTMLElement)

      const measure = () => {
        const top =
          scrollNode === window
            ? window.scrollY
            : (scrollNode as HTMLElement).scrollTop
        setVisible(top > visibilityHeight)
      }

      measure()
      element.addEventListener('scroll', measure, { passive: true })
      return () => element.removeEventListener('scroll', measure)
    }, [visibilityHeight, target])

    const scrollToTop = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return

      const scrollNode = target?.() ?? window
      if (scrollNode === window) window.scrollTo({ top: 0, behavior: 'smooth' })
      else (scrollNode as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!visible) return null

    return (
      <FloatButton
        ref={ref}
        aria-label={label}
        title={label}
        data-slot="back-top"
        className={className}
        icon={icon ?? <ArrowUpToLineIcon aria-hidden className="size-4" />}
        onClick={scrollToTop}
        {...props}
      />
    )
  }
)
BackTop.displayName = 'BackTop'

export { BackTop, FloatButton, FloatButtonGroup, floatButtonVariants }
export type { FloatPosition }
