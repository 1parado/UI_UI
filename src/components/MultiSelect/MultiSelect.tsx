import * as React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/Command'
import { useControllableStringArray } from '@/lib/use-controllable-state'
import { CheckIcon, ChevronDownIcon, XIcon } from '@/lib/icons'

const SELECT_ALL = '__select-all__'

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  /** Section the option belongs to. Order follows first appearance. */
  group?: string
}

export interface MultiSelectLabels {
  /** Row that selects everything currently on offer. */
  selectAll?: string
  /** Row that clears the selection. */
  clearAll?: string
  /** Word after the count in the footer, e.g. "3 selected". */
  selected?: string
  /** Shown in the footer once `maxSelected` is reached. */
  limitReached?: string
}

export interface MultiSelectProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange'
  > {
  options: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  /** Cap on how many may be picked at once. */
  maxSelected?: number
  /** Offer a row that selects or clears everything. Defaults to `true`. */
  selectAll?: boolean
  /** Chips shown on the trigger before the rest collapse into a count. */
  maxVisibleChips?: number
  width?: string
  align?: 'start' | 'center' | 'end'
  /** Text for the built-in controls, for localisation. */
  labels?: MultiSelectLabels
}

/**
 * Multi-select with grouped options, a select-all row and an optional ceiling
 * on how many values may be held at once.
 *
 * `ComboboxMultiple` is the plain version — flat list, no cap, no bulk action.
 * This one is for the picker that sits in front of a real form: model access
 * lists, team members, tags with a limit.
 *
 * ```tsx
 * const [models, setModels] = React.useState<string[]>(['gpt-4o'])
 * <MultiSelect
 *   options={models}
 *   value={models}
 *   onValueChange={setModels}
 *   maxSelected={3}
 * />
 * ```
 */
const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Select options',
      searchPlaceholder = 'Search…',
      emptyMessage = 'No matches.',
      maxSelected,
      selectAll = true,
      maxVisibleChips = 3,
      width = '19rem',
      align = 'start',
      className,
      labels,
      disabled,
      ...props
    },
    ref
  ) => {
    const {
      selectAll: selectAllLabel = 'Select all',
      clearAll = 'Clear selection',
      selected: selectedLabel = 'selected',
      limitReached = 'Limit reached',
    } = labels ?? {}

    const [open, setOpen] = React.useState(false)
    const [selectedValues, setSelectedValues] = useControllableStringArray({
      value,
      defaultValue,
      onValueChange,
    })

    const selectable = React.useMemo(
      () => options.filter((option) => !option.disabled),
      [options]
    )
    const selectedOptions = options.filter((option) => selectedValues.includes(option.value))
    const atLimit = maxSelected !== undefined && selectedValues.length >= maxSelected
    const allSelected =
      selectable.length > 0 && selectable.every((option) => selectedValues.includes(option.value))

    // Group order follows first appearance in `options` rather than sorting, so
    // the caller keeps control of the running order.
    const groups = React.useMemo(() => {
      const map = new Map<string, MultiSelectOption[]>()
      for (const option of options) {
        const key = option.group ?? ''
        const bucket = map.get(key)
        if (bucket) bucket.push(option)
        else map.set(key, [option])
      }
      return Array.from(map, ([name, items]) => ({ name, items }))
    }, [options])

    const toggle = (optionValue: string) => {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((entry) => entry !== optionValue)
        : [...selectedValues, optionValue]
      setSelectedValues(next)
    }

    const toggleAll = () => {
      if (allSelected) {
        setSelectedValues([])
        return
      }
      const values = selectable.map((option) => option.value)
      setSelectedValues(
        maxSelected === undefined ? values : values.slice(0, maxSelected)
      )
    }

    const visibleChips = selectedOptions.slice(0, maxVisibleChips)
    const hiddenCount = selectedOptions.length - visibleChips.length

    return (
      <div className="relative inline-flex" style={{ width }}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-auto min-h-10 w-full justify-between gap-2 px-3 py-1.5 font-normal',
                selectedOptions.length === 0 && 'text-muted-foreground',
                className
              )}
              {...props}
            >
              <span className="flex flex-wrap items-center gap-1 text-left">
                {selectedOptions.length === 0 ? (
                  <span className="truncate">{placeholder}</span>
                ) : (
                  <>
                    {visibleChips.map((option) => (
                      <span
                        key={option.value}
                        className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {option.label}
                      </span>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                        +{hiddenCount}
                      </span>
                    )}
                  </>
                )}
              </span>

              <span className="flex shrink-0 items-center">
                {selectedOptions.length > 0 && (
                  // Mouse-only: a real control cannot live inside another
                  // button, and clearing is already on the keyboard path via
                  // the select-all row inside the panel.
                  <span
                    aria-hidden="true"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setSelectedValues([])
                    }}
                    className="mr-1 rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </span>
                )}
                <ChevronDownIcon aria-hidden="true" className="h-4 w-4 opacity-50" />
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent
            align={align}
            className="p-0"
            style={{ width: `var(--radix-popover-trigger-width, ${width})` }}
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />

              {/* Outside the filtered list: a bulk action that vanishes as soon
                  as you start typing would be its own small trap. */}
              {selectAll && selectable.length > 1 && (
                <div className="border-b border-border p-1">
                  <CommandItem
                    value={SELECT_ALL}
                    forceMount
                    onSelect={toggleAll}
                    className="justify-between"
                  >
                    <span>{allSelected ? clearAll : selectAllLabel}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {selectedValues.length}/{selectable.length}
                    </span>
                  </CommandItem>
                </div>
              )}

              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>

                {groups.map((group, index) => (
                  <CommandGroup key={group.name || `__group-${index}`} heading={group.name || undefined}>
                    {group.items.map((option) => {
                      const isSelected = selectedValues.includes(option.value)
                      const blocked = atLimit && !isSelected
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          keywords={[option.label, option.description ?? '']}
                          disabled={option.disabled || blocked}
                          onSelect={() => toggle(option.value)}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:hidden'
                            )}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate">{option.label}</span>
                            {option.description && (
                              <span className="truncate text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))}
              </CommandList>

              {selectedValues.length > 0 && (
                <div className="flex items-center justify-between border-t border-border px-2 py-1.5 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {selectedValues.length} {selectedLabel}
                  </span>
                  {maxSelected !== undefined && (
                    <span className={cn(atLimit && 'text-warning')}>
                      {atLimit ? limitReached : `${selectedValues.length}/${maxSelected}`}
                    </span>
                  )}
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
MultiSelect.displayName = 'MultiSelect'

export { MultiSelect }
