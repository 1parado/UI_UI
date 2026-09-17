import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useControllableString } from '@/lib/use-controllable-state'

const segmentedVariants = cva(
  'relative inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5 text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'h-7 text-xs',
        md: 'h-9 text-sm',
        lg: 'h-11 text-sm',
      },
      /** Stretch to the container and give every option an equal share. */
      block: { true: 'flex w-full', false: '' },
    },
    defaultVariants: { size: 'md', block: false },
  }
)

const itemVariants = cva(
  [
    'relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md',
    'px-3 font-medium transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
      },
      selected: { true: 'text-foreground', false: 'hover:text-foreground' },
      block: { true: 'flex-1', false: '' },
    },
    defaultVariants: { size: 'md', selected: false, block: false },
  }
)

export interface SegmentedOption {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedLabels {
  /** Accessible name for the whole control. */
  group?: string
}

export interface SegmentedProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'defaultValue' | 'children'
    >,
    VariantProps<typeof segmentedVariants> {
  /** Option rows. Use this or `children`, not both. */
  options?: SegmentedOption[]
  /** Selected value when the caller owns it. */
  value?: string
  /** Selected value on the first render when the component owns it. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  labels?: SegmentedLabels
  /** Compose the options yourself when a row needs more than an icon and a label. */
  children?: React.ReactNode
}

/**
 * A segmented control: one choice out of a few, all of them visible.
 *
 * `ToggleGroup` covers the visual case, but a segmented control is a **radio
 * group** to assistive technology — one tab stop, arrow keys move between
 * options, and the selected one is `aria-checked`. A row of toggles announces
 * itself as a toolbar of independent buttons, which is the wrong thing to say
 * about a setting that has exactly one value.
 *
 * The sliding thumb is measured off the selected button, so options do not have
 * to be the same width. Without a layout engine (jsdom, SSR) it measures 0 and
 * simply stays out of the way.
 *
 * ```tsx
 * <Segmented
 *   defaultValue="list"
 *   onValueChange={setView}
 *   options={[
 *     { value: 'list', label: 'List' },
 *     { value: 'board', label: 'Board' },
 *   ]}
 * />
 * ```
 */
const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (
    {
      className,
      size = 'md',
      block = false,
      options,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      labels,
      children,
      ...props
    },
    ref
  ) => {
    const [selected, setSelected] = useControllableString({
      value,
      defaultValue: defaultValue ?? '',
      onValueChange,
    })

    const listRef = React.useRef<HTMLDivElement | null>(null)
    const itemRefs = React.useRef(new Map<string, HTMLButtonElement>())
    const [thumb, setThumb] = React.useState<{ left: number; width: number } | null>(null)

    const enabled = React.useMemo(
      () => (options ?? []).filter((option) => !option.disabled),
      [options]
    )

    // The thumb tracks the selected button's box, so unequal widths work.
    React.useLayoutEffect(() => {
      const node = itemRefs.current.get(selected)
      if (!node) {
        setThumb(null)
        return
      }

      const measure = () =>
        setThumb({ left: node.offsetLeft, width: node.offsetWidth })

      measure()

      // A font swap or a breakpoint change moves the buttons without a render.
      if (typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(measure)
      observer.observe(node)
      return () => observer.disconnect()
    }, [selected, options, children])

    const select = (next: string) => {
      if (next !== selected) setSelected(next)
    }

    const move = (delta: number) => {
      if (enabled.length === 0) return null
      const current = enabled.findIndex((option) => option.value === selected)
      // Nothing selected yet: the first arrow key arrives at the first option.
      const next = enabled[(current + delta + enabled.length) % enabled.length]
      return next.value
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const delta =
        event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
            ? -1
            : 0
      if (delta === 0) return

      event.preventDefault()
      const next = move(delta)
      if (next === null) return

      select(next)
      itemRefs.current.get(next)?.focus()
    }

    const register = (optionValue: string) => (node: HTMLButtonElement | null) => {
      if (node) itemRefs.current.set(optionValue, node)
      else itemRefs.current.delete(optionValue)
    }

    return (
      <div
        ref={(node) => {
          listRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        role="radiogroup"
        aria-label={labels?.group}
        data-disabled={disabled || undefined}
        className={cn(segmentedVariants({ size, block }), className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {thumb && (
          <span
            aria-hidden
            data-slot="segmented-thumb"
            className="absolute inset-y-0.5 left-0 rounded-md bg-background shadow-sm transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateX(${thumb.left}px)`,
              width: thumb.width,
            }}
          />
        )}

        {options
          ? options.map((option) => {
              const on = option.value === selected
              return (
                <button
                  key={option.value}
                  ref={register(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  // One tab stop for the group: only the selection is reachable.
                  tabIndex={on || (selected === '' && enabled[0]?.value === option.value) ? 0 : -1}
                  disabled={disabled || option.disabled}
                  data-selected={on || undefined}
                  className={cn(itemVariants({ size, selected: on, block }))}
                  onClick={() => select(option.value)}
                >
                  {option.icon}
                  {option.label}
                </button>
              )
            })
          : children}
      </div>
    )
  }
)
Segmented.displayName = 'Segmented'

export interface SegmentedItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Matches the value the parent is comparing against. */
  value: string
  /** Set by the parent — when composing `Segmented` from children. */
  selected?: boolean
}

/**
 * One option, for when a row needs more than an icon and a label. Rendering
 * these yourself means wiring `role="radio"` and `aria-checked` by hand.
 */
const SegmentedItem = React.forwardRef<HTMLButtonElement, SegmentedItemProps>(
  ({ className, value, selected = false, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      data-value={value}
      data-selected={selected || undefined}
      className={cn(
        'relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3',
        'h-8 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        selected ? 'text-foreground' : 'hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
SegmentedItem.displayName = 'SegmentedItem'

export { Segmented, SegmentedItem }
