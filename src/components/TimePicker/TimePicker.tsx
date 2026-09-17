import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { Calendar } from '@/components/Calendar'
import { useControllableString } from '@/lib/use-controllable-state'
import { ChevronDownIcon, ClockIcon } from '@/lib/icons'

const pad = (value: number) => String(value).padStart(2, '0')

/** `'09:30'` → `{ hours: 9, minutes: 30 }`. Returns `null` for anything else. */
function parseTime(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

/**
 * The wire format is always 24-hour `HH:mm` even when the picker displays a
 * 12-hour clock — an AM/PM suffix in the stored value is the kind of thing that
 * only breaks once someone sorts a list.
 */
function formatTime(hours: number, minutes: number, hourCycle: 12 | 24): string {
  if (hourCycle === 24) return `${pad(hours)}:${pad(minutes)}`
  const period = hours < 12 ? 'AM' : 'PM'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return `${display}:${pad(minutes)} ${period}`
}

function parseDateTime(value: string): { date: Date; time: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const [, year, month, day, hours, minutes] = match
  return {
    // Built from parts on purpose: `new Date('2026-09-17')` is parsed as UTC
    // and lands on the previous day for anyone east of Greenwich.
    date: new Date(Number(year), Number(month) - 1, Number(day)),
    time: hours !== undefined && minutes !== undefined ? `${pad(Number(hours))}:${minutes}` : '',
  }
}

function toDateTimeValue(date: Date, time: string): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time || '00:00'}`
}

const triggerClassName =
  'inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const columnClassName =
  'h-56 w-14 shrink-0 overflow-y-auto overscroll-contain rounded-md border border-border p-1'

const optionClassName = (selected: boolean) =>
  cn(
    'flex h-8 w-full items-center justify-center rounded-sm text-sm tabular-nums transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    selected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
  )

export interface TimeColumnsLabels {
  /** Accessible name for the hour column. */
  hour?: string
  /** Accessible name for the minute column. */
  minute?: string
  /** Accessible names for the two halves of the AM/PM toggle. */
  am?: string
  pm?: string
}

export interface TimeColumnsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current value, `HH:mm`. */
  value?: string
  onValueChange?: (value: string) => void
  /** Minute granularity: 1, 5, 15, 30. Defaults to 1. */
  minuteStep?: number
  /** Display clock. The value stays 24-hour either way. */
  hourCycle?: 12 | 24
  disabled?: boolean
  labels?: TimeColumnsLabels
}

/**
 * The two scrollable columns on their own, without the popover or the trigger.
 * Use this when the time field is part of a larger panel — `DateTimePicker`
 * does exactly that, and so would a scheduling form that shows the calendar
 * and the clock side by side.
 */
const TimeColumns = React.forwardRef<HTMLDivElement, TimeColumnsProps>(
  (
    {
      className,
      value = '',
      onValueChange,
      minuteStep = 1,
      hourCycle = 24,
      disabled,
      labels,
      ...props
    },
    ref
  ) => {
    const {
      hour: hourLabel = 'Hour',
      minute: minuteLabel = 'Minute',
      am = 'AM',
      pm = 'PM',
    } = labels ?? {}

    const parsed = parseTime(value)
    const hours = parsed?.hours ?? 0
    const minutes = parsed?.minutes ?? 0

    const minuteOptions = React.useMemo(() => {
      const step = Math.min(Math.max(Math.round(minuteStep), 1), 60)
      const list: number[] = []
      for (let minute = 0; minute < 60; minute += step) list.push(minute)
      return list
    }, [minuteStep])

    const hourOptions = React.useMemo(() => {
      if (hourCycle === 24) return Array.from({ length: 24 }, (_, index) => index)
      // 12-hour clocks run 12, 1 … 11 — the period toggle carries the rest.
      return Array.from({ length: 12 }, (_, index) => (index === 0 ? 12 : index))
    }, [hourCycle])

    const period: 'AM' | 'PM' = hours < 12 ? 'AM' : 'PM'
    const displayHour = hours % 12 === 0 ? 12 : hours % 12

    const emit = (nextHours: number, nextMinutes: number) =>
      onValueChange?.(`${pad(nextHours)}:${pad(nextMinutes)}`)

    // Bring the current selection into view when the panel opens. `nearest`
    // keeps a value that is already visible from jumping to the middle.
    const selectedOptionRef = React.useRef<HTMLButtonElement>(null)
    React.useEffect(() => {
      selectedOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    }, [hourCycle])

    const selectHour = (option: number) => {
      if (hourCycle === 24) {
        emit(option, minutes)
        return
      }
      const base = option % 12
      emit(period === 'PM' ? base + 12 : base, minutes)
    }

    const setPeriod = (next: 'AM' | 'PM') => {
      if (next === period) return
      emit(next === 'PM' ? hours + 12 : hours - 12, minutes)
    }

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        <div className="flex gap-2">
          <div role="listbox" aria-label={hourLabel} className={columnClassName}>
            {hourOptions.map((option) => {
              const selected = hourCycle === 24 ? option === hours : option === displayHour
              return (
                <button
                  key={option}
                  ref={selected ? selectedOptionRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => selectHour(option)}
                  className={optionClassName(selected)}
                >
                  {hourCycle === 24 ? pad(option) : option}
                </button>
              )
            })}
          </div>

          <div role="listbox" aria-label={minuteLabel} className={columnClassName}>
            {minuteOptions.map((option) => {
              const selected = option === minutes
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => emit(hours, option)}
                  className={optionClassName(selected)}
                >
                  {pad(option)}
                </button>
              )
            })}
          </div>

          {hourCycle === 12 && (
            <div
              role="listbox"
              aria-label={`${am} / ${pm}`}
              className="flex h-56 w-14 shrink-0 flex-col justify-center gap-1 rounded-md border border-border p-1"
            >
              {(['AM', 'PM'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={period === option}
                  disabled={disabled}
                  onClick={() => setPeriod(option)}
                  className={optionClassName(period === option)}
                >
                  {option === 'AM' ? am : pm}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
TimeColumns.displayName = 'TimeColumns'

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value, `HH:mm` on a 24-hour clock. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Minute granularity: 1, 5, 15, 30. Defaults to 1. */
  minuteStep?: number
  /** Show a 12-hour clock. The value stays `HH:mm`. */
  hourCycle?: 12 | 24
  /** Text shown before a time is chosen. */
  placeholder?: string
  /** Use the browser's own time field instead of the panel. */
  native?: boolean
  name?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  /** Accessible name for the control. */
  'aria-label'?: string
  /** Column and toggle names, for localisation. */
  labels?: TimeColumnsLabels
}

/**
 * A time field backed by hour and minute columns rather than free text, so an
 * entry cannot be three characters from valid.
 *
 * ```tsx
 * const [at, setAt] = React.useState('09:30')
 * <TimePicker value={at} onValueChange={setAt} minuteStep={5} />
 * ```
 */
const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      minuteStep = 1,
      hourCycle = 24,
      placeholder = 'Pick a time',
      native = false,
      name,
      disabled,
      align = 'start',
      className,
      id,
      'aria-label': ariaLabel = 'Time',
      labels,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [time, setTime] = useControllableString({ value, defaultValue, onValueChange })
    const parsed = parseTime(time)
    const display = parsed ? formatTime(parsed.hours, parsed.minutes, hourCycle) : ''

    if (native) {
      return (
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
          <input
            type="time"
            id={id}
            name={name}
            value={time}
            disabled={disabled}
            aria-label={ariaLabel}
            step={minuteStep * 60}
            onChange={(event) => setTime(event.target.value)}
            className={cn(triggerClassName, 'cursor-pointer')}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {name && <input type="hidden" name={name} value={time} />}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={triggerClassName}
            >
              <ClockIcon aria-hidden="true" className="h-4 w-4 opacity-60" />
              <span className={cn('tabular-nums', !display && 'text-muted-foreground')}>
                {display || placeholder}
              </span>
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>

          <PopoverContent align={align} className="w-auto p-3">
            <TimeColumns
              value={time}
              onValueChange={setTime}
              minuteStep={minuteStep}
              hourCycle={hourCycle}
              disabled={disabled}
              labels={labels}
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  const now = new Date()
                  setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`)
                }}
                className="h-7 px-2 text-xs text-muted-foreground"
              >
                Now
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
TimePicker.displayName = 'TimePicker'

export interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value, `YYYY-MM-DDTHH:mm` — the same shape `datetime-local` uses. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  minuteStep?: number
  hourCycle?: 12 | 24
  placeholder?: string
  /** Date matcher passed through to the calendar, e.g. `{ dayOfWeek: [0, 6] }`. */
  disabledDays?: React.ComponentProps<typeof Calendar>['disabled']
  /** Use the browser's own date-and-time field instead of the panel. */
  native?: boolean
  name?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  'aria-label'?: string
  labels?: TimeColumnsLabels
}

/**
 * A calendar and a clock behind one trigger. The value is a single
 * `YYYY-MM-DDTHH:mm` string so it round-trips through `datetime-local`, JSON and
 * `new Date()` without a translation step in between.
 *
 * ```tsx
 * const [at, setAt] = React.useState('2026-09-17T09:30')
 * <DateTimePicker value={at} onValueChange={setAt} minuteStep={15} />
 * ```
 */
const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      minuteStep = 1,
      hourCycle = 24,
      placeholder = 'Pick a date and time',
      disabledDays,
      native = false,
      name,
      disabled,
      align = 'start',
      className,
      id,
      'aria-label': ariaLabel = 'Date and time',
      labels,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [current, setCurrent] = useControllableString({ value, defaultValue, onValueChange })
    const parsed = parseDateTime(current)
    const time = parsed?.time || '00:00'

    const display = parsed
      ? `${parsed.date.toLocaleDateString(undefined, { dateStyle: 'medium' })}, ${formatTime(
          parseTime(time)?.hours ?? 0,
          parseTime(time)?.minutes ?? 0,
          hourCycle
        )}`
      : ''

    const setDate = (date: Date | undefined) => {
      if (!date) return
      setCurrent(toDateTimeValue(date, time))
    }

    if (native) {
      return (
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
          <input
            type="datetime-local"
            id={id}
            name={name}
            value={current}
            disabled={disabled}
            aria-label={ariaLabel}
            onChange={(event) => setCurrent(event.target.value)}
            className={cn(triggerClassName, 'cursor-pointer')}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {name && <input type="hidden" name={name} value={current} />}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(buttonVariants({ variant: 'outline' }), 'justify-start font-normal')}
            >
              <ClockIcon aria-hidden="true" className="h-4 w-4 opacity-60" />
              <span className={cn('truncate', !display && 'text-muted-foreground')}>
                {display || placeholder}
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent align={align} className="w-auto p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Calendar
                mode="single"
                selected={parsed?.date}
                defaultMonth={parsed?.date}
                disabled={disabledDays}
                onSelect={setDate}
              />
              <TimeColumns
                value={time}
                onValueChange={(next) => {
                  if (parsed) setCurrent(toDateTimeValue(parsed.date, next))
                }}
                minuteStep={minuteStep}
                hourCycle={hourCycle}
                disabled={disabled}
                labels={labels}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
DateTimePicker.displayName = 'DateTimePicker'

export { TimePicker, TimeColumns, DateTimePicker, parseTime, formatTime }
