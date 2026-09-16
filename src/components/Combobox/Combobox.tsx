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
import { CheckIcon, ChevronDownIcon, XIcon } from '@/lib/icons'

export interface ComboboxOption {
  value: string
  label: string
  /** Secondary line under the label — a model id, a path, a hint. */
  description?: string
  disabled?: boolean
}

interface ComboboxBaseProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'onChange' | 'defaultValue' | 'children'
  > {
  options: ComboboxOption[]
  /** Shown on the trigger while nothing is selected. */
  placeholder?: string
  /** Placeholder of the search field inside the popover. */
  searchPlaceholder?: string
  /** Shown when the search matches nothing. */
  emptyMessage?: string
  /** Width of the trigger and the popover. Defaults to `15rem`. */
  width?: string
  align?: 'start' | 'center' | 'end'
}

export interface ComboboxProps extends ComboboxBaseProps {
  value?: string
  onValueChange?: (value: string) => void
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
}

const optionLabel = (option: ComboboxOption) =>
  option.description ? `${option.label} ${option.description}` : option.label

/** Option row shared by both pickers: check mark, label, optional description. */
function OptionRow({ option, checked }: { option: ComboboxOption; checked: boolean }) {
  return (
    <>
      <CheckIcon
        className={cn('h-4 w-4 shrink-0', checked ? 'opacity-100' : 'opacity-0')}
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="truncate text-xs text-muted-foreground">
            {option.description}
          </span>
        ) : null}
      </span>
    </>
  )
}

/**
 * Searchable single-select. `Combobox` keeps the value in your state; the list
 * filters as you type and closes on pick.
 *
 * ```tsx
 * const [model, setModel] = React.useState('')
 * <Combobox
 *   value={model}
 *   onValueChange={setModel}
 *   options={[{ value: 'gpt-4o', label: 'GPT-4o', description: '128k context' }]}
 * />
 * ```
 */
const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search…',
      emptyMessage = 'No matches.',
      width = '15rem',
      align = 'start',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const selected = options.find((option) => option.value === value)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            style={{ width }}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'justify-between gap-2 font-normal',
              !selected && 'text-muted-foreground',
              className
            )}
            {...props}
          >
            <span className="flex min-w-0 flex-col items-start text-left">
              <span className="truncate">{selected ? selected.label : placeholder}</span>
              {selected?.description ? (
                <span className="truncate text-xs text-muted-foreground">
                  {selected.description}
                </span>
              ) : null}
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className="p-0"
          style={{ width: `var(--radix-popover-trigger-width, ${width})` }}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, option.description ?? '']}
                    disabled={option.disabled}
                    onSelect={() => {
                      onValueChange?.(option.value)
                      setOpen(false)
                    }}
                  >
                    <OptionRow option={option} checked={option.value === value} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
Combobox.displayName = 'Combobox'

/**
 * Multi-select with chips on the trigger. Items toggle rather than close the
 * list, and the trailing control clears everything at once.
 */
const ComboboxMultiple = React.forwardRef<HTMLButtonElement, ComboboxMultipleProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select options',
      searchPlaceholder = 'Search…',
      emptyMessage = 'No matches.',
      width = '19rem',
      align = 'start',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const selectedValues = value ?? []
    const selected = options.filter((option) => selectedValues.includes(option.value))

    const toggle = (optionValue: string) =>
      onValueChange?.(
        selectedValues.includes(optionValue)
          ? selectedValues.filter((item) => item !== optionValue)
          : [...selectedValues, optionValue]
      )

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
                selected.length === 0 && 'text-muted-foreground',
                selected.length > 0 && 'pr-8',
                className
              )}
              {...props}
            >
              <span className="flex flex-wrap items-center gap-1">
                {selected.length === 0 ? (
                  <span className="truncate">{placeholder}</span>
                ) : (
                  selected.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {option.label}
                    </span>
                  ))
                )}
              </span>
              <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align={align}
            className="p-0"
            style={{ width: `var(--radix-popover-trigger-width, ${width})` }}
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label, option.description ?? '']}
                      disabled={option.disabled}
                      onSelect={() => toggle(option.value)}
                    >
                      <OptionRow
                        option={option}
                        checked={selectedValues.includes(option.value)}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selected.length > 0 && !disabled ? (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => onValueChange?.([])}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)
ComboboxMultiple.displayName = 'ComboboxMultiple'

export { Combobox, ComboboxMultiple, optionLabel }
