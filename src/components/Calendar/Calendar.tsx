import * as React from 'react'
import {
  DayPicker,
  type ChevronProps,
  type DayButtonProps,
} from 'react-day-picker'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@/lib/icons'

/**
 * Month grid built on react-day-picker v9. Styling is supplied here rather than
 * imported from the library's stylesheet, so every colour and radius comes from
 * the design tokens and nothing leaks into the bundle.
 *
 * `mode` decides the selection shape: `"single"` for a date, `"range"` for a
 * span, `"multiple"` for a set of days. The picker is fully controlled —
 * `DatePicker` wraps it in a popover if that is all you need.
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarChevron({
  className,
  orientation = 'right',
  size = 16,
}: ChevronProps) {
  const Icon =
    orientation === 'left'
      ? ChevronLeftIcon
      : orientation === 'right'
        ? ChevronRightIcon
        : orientation === 'up'
          ? ChevronUpIcon
          : ChevronDownIcon

  return <Icon className={cn('h-4 w-4', className)} width={size} height={size} />
}

/**
 * One day. The range band lives on the cell (below), so the endpoint buttons
 * only square off the corners that touch the band.
 */
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const inRange = modifiers.range_start || modifiers.range_end || modifiers.range_middle

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.isoDate}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // A lone selection and both ends of a range share the filled look.
        (modifiers.range_start || modifiers.range_end || (modifiers.selected && !inRange)) &&
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        modifiers.range_middle &&
          'rounded-none bg-accent text-accent-foreground hover:bg-accent',
        modifiers.range_start && 'rounded-r-none',
        modifiers.range_end && 'rounded-l-none',
        modifiers.today && !inRange && !modifiers.selected && 'border border-border font-medium',
        className
      )}
      {...props}
    />
  )
}

function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'relative',
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'flex flex-col gap-4',
        // The nav floats over the caption row, so prev/next keep the same
        // position whether or not the caption shows a dropdown.
        nav: 'absolute inset-x-3 top-3 flex items-center justify-between',
        button_previous:
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
        button_next:
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
        chevron: 'h-4 w-4',
        month_caption: 'flex h-7 items-center justify-center',
        caption_label: 'text-sm font-medium',
        dropdowns: 'flex items-center justify-center gap-2',
        dropdown_root: 'relative',
        dropdown:
          'appearance-none rounded-md border border-input bg-background px-2 py-1 pr-6 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        months_dropdown: 'appearance-none rounded-md border border-input bg-background px-2 py-1 text-sm',
        years_dropdown: 'appearance-none rounded-md border border-input bg-background px-2 py-1 text-sm',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 rounded-md text-xs font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        // The band is drawn on the cell so a range reads as one continuous bar.
        day: 'relative h-9 w-9 p-0 text-center text-sm',
        range_start: 'rounded-l-md bg-accent',
        range_middle: 'bg-accent',
        range_end: 'rounded-r-md bg-accent',
        outside: 'text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        week_number_header: 'w-9 text-xs font-normal text-muted-foreground',
        week_number: 'text-xs text-muted-foreground',
        footer: 'pt-2 text-sm text-muted-foreground',
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton, CalendarChevron }
