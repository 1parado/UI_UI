import * as React from 'react'
import type { DateRange, Matcher } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { Calendar } from '@/components/Calendar'
import { CalendarIcon, XIcon } from '@/lib/icons'

/** Locale-aware by default; pass your own to pin a format. */
const formatDay = (date: Date) =>
  date.toLocaleDateString(undefined, { dateStyle: 'medium' })

const rangeSeparator = '–'

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export interface DatePickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  /** Shown while nothing is selected. */
  placeholder?: string
  /** Show the clear affordance once a date is chosen. Defaults to true. */
  clearable?: boolean
  /** Dates the user may not pick — a matcher from react-day-picker. */
  disabledDays?: Matcher | Matcher[]
  /** Month the calendar opens on when nothing is selected. Defaults to today. */
  defaultMonth?: Date
  /** Override how the chosen date reads, e.g. `YYYY-MM-DD`. */
  formatDate?: (date: Date) => string
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * Single date behind a popover trigger. Controlled: keep the `Date` in state
 * and let `onValueChange` move it.
 */
const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onValueChange,
      placeholder = 'Pick a date',
      clearable = true,
      disabledDays,
      defaultMonth,
      formatDate = formatDay,
      align = 'start',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className={cn('relative inline-flex', className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              aria-haspopup="dialog"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-[15rem] justify-start gap-2 pr-8 font-normal',
                !value && 'text-muted-foreground'
              )}
              {...props}
            >
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate">
                {value ? formatDate(value) : placeholder}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align={align} className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              defaultMonth={defaultMonth ?? value}
              disabled={disabledDays}
              onSelect={(date) => {
                onValueChange?.(date)
                // A single date is a complete answer — close so the click lands.
                if (date) setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Outside the trigger: a button inside a button is invalid markup. */}
        {clearable && value && !disabled ? (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => onValueChange?.(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'

export interface DateRangePickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  placeholder?: string
  clearable?: boolean
  disabledDays?: Matcher | Matcher[]
  /** Month the calendar opens on when nothing is selected. Defaults to today. */
  defaultMonth?: Date
  /** Months shown side by side once there is room. Defaults to 2. */
  numberOfMonths?: number
  formatDate?: (date: Date) => string
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * Date span in one control. `value` is `{ from, to }`; `to` stays empty until
 * the user picks the second day, so an in-progress range is representable.
 */
const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(
  (
    {
      value,
      onValueChange,
      placeholder = 'Pick a date range',
      clearable = true,
      disabledDays,
      defaultMonth,
      numberOfMonths = 2,
      formatDate = formatDay,
      align = 'start',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    // react-day-picker reports `{ from, to: from }` on the first click, so the
    // range's completeness cannot be read off `to`. Count the clicks instead:
    // the first one starts the span, the second closes the popover.
    const pending = React.useRef(false)

    const singleDay = value?.from && value.to && isSameDay(value.from, value.to)
    const label = value?.from
      ? value.to && !singleDay
        ? `${formatDate(value.from)} ${rangeSeparator} ${formatDate(value.to)}`
        : formatDate(value.from)
      : placeholder

    return (
      <div className={cn('relative inline-flex', className)}>
        <Popover
          open={open}
          onOpenChange={(next) => {
            pending.current = false
            setOpen(next)
          }}
        >
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              aria-haspopup="dialog"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-[19rem] justify-start gap-2 pr-8 font-normal',
                !value?.from && 'text-muted-foreground'
              )}
              {...props}
            >
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate">{label}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align={align} className="w-auto p-0">
            <Calendar
              mode="range"
              autoFocus
              numberOfMonths={numberOfMonths}
              defaultMonth={defaultMonth ?? value?.from}
              selected={value}
              disabled={disabledDays}
              onSelect={(range) => {
                onValueChange?.(range)
                if (!pending.current) {
                  pending.current = true
                  return
                }
                pending.current = false
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>

        {clearable && value?.from && !disabled ? (
          <button
            type="button"
            aria-label="Clear date range"
            onClick={() => onValueChange?.(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)
DateRangePicker.displayName = 'DateRangePicker'

export { DatePicker, DateRangePicker, formatDay }
