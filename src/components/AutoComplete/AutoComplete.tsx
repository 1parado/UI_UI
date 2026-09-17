import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/Input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/Popover'
import {
  type AutoCompleteFilter,
  type AutoCompleteOption,
  groupOptions,
  matchOptions,
  nextIndex,
  normalizeOptions,
  optionText,
} from '@/lib/autocomplete'
import { XIcon } from '@/lib/icons'
import { useControllableString } from '@/lib/use-controllable-state'

export interface AutoCompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'onSelect' | 'children' | 'size'
  > {
  options: (string | AutoCompleteOption)[]
  /** The field's text. Omit to let the component hold it. */
  value?: string
  defaultValue?: string
  /** Every keystroke, plus the final pick. */
  onChange?: (value: string) => void
  /** A suggestion was accepted. */
  onSelect?: (value: string, option: AutoCompleteOption) => void
  /** How the text narrows the list. `fn` hands it to `filterOption`. */
  filterMode?: AutoCompleteFilter
  filterOption?: (query: string, option: AutoCompleteOption) => boolean
  /** Cap how many rows the list can get. */
  maxSuggestions?: number
  /** Suggest everything as soon as the field takes focus. */
  openOnFocus?: boolean
  /** Leave the list up after a pick, for several in a row. */
  keepOpen?: boolean
  clearable?: boolean
  emptyText?: React.ReactNode
}

/**
 * A text field that offers suggestions but never insists on them.
 *
 * The sibling of `Combobox`: there the field restates a choice from a closed
 * list, here whatever the user types is already valid and the list is only a
 * shortcut to a longer string. So suggestions are derived from the text on
 * every keystroke, and the value stays a plain string.
 *
 * The input keeps focus the whole time — the suggestions are offered, never
 * taken — which is why the panel suppresses its own auto-focus and the rows
 * hold their ground against mousedown.
 *
 * ```tsx
 * <AutoComplete options={['main', 'master', 'develop']} placeholder="Branch" />
 * ```
 */
const AutoComplete = React.forwardRef<HTMLInputElement, AutoCompleteProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      onSelect,
      filterMode = 'includes',
      filterOption,
      maxSuggestions,
      openOnFocus = false,
      keepOpen = false,
      clearable = false,
      placeholder = 'Start typing…',
      emptyText = 'No matches',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [text, setText] = useControllableString({
      value,
      defaultValue,
      onValueChange: onChange,
    })

    const [open, setOpen] = React.useState(false)
    const [active, setActive] = React.useState(-1)

    const listId = React.useId()
    const matches = React.useMemo(
      () =>
        matchOptions(options, text, {
          mode: filterMode,
          filterOption,
          limit: maxSuggestions,
        }),
      [options, text, filterMode, filterOption, maxSuggestions]
    )
    const groups = React.useMemo(() => groupOptions(matches), [matches])

    const pick = (option: AutoCompleteOption) => {
      if (option.disabled === true) return

      setText(option.value)
      onSelect?.(option.value, option)
      setActive(-1)
      if (!keepOpen) setOpen(false)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!open) setOpen(true)
          setActive((current) => nextIndex(matches, current, 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          if (!open) setOpen(true)
          setActive((current) => nextIndex(matches, current, -1))
          break
        case 'Enter': {
          const option = matches[active]
          // Only swallow the keystroke when there is something to accept —
          // otherwise Enter still has to submit the surrounding form.
          if (!open || !option || option.disabled === true) return
          event.preventDefault()
          pick(option)
          break
        }
        case 'Escape':
          if (open) {
            event.preventDefault()
            setOpen(false)
            setActive(-1)
          }
          break
        case 'Tab':
          setOpen(false)
          break
        default:
          break
      }
    }

    let row = -1
    const activeOption = matches[active]

    return (
      <div className="relative inline-flex w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Input
                ref={ref}
                value={text}
                disabled={disabled}
                placeholder={placeholder}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  open && activeOption ? `${listId}-${active}` : undefined
                }
                className={cn(className, clearable && 'pr-8')}
                onChange={(event) => {
                  setText(event.target.value)
                  setActive(-1)
                  setOpen(true)
                }}
                onFocus={() => {
                  if (openOnFocus) setOpen(true)
                }}
                onKeyDown={onKeyDown}
                {...props}
              />
            </div>
          </PopoverAnchor>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="p-1"
            style={{ width: 'var(--radix-popover-trigger-width, 16rem)' }}
            // The field is the point of this component; stealing focus from it
            // would break typing on the very frame the list appears.
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {matches.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              <ul id={listId} role="listbox" aria-label="Suggestions" className="max-h-60 overflow-auto">
                {groups.map((group, groupIndex) => (
                  <li key={`${group.group ?? 'ungrouped'}-${groupIndex}`}>
                    {group.group && (
                      <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {group.group}
                      </p>
                    )}
                    <ul role="group" aria-label={group.group}>
                      {group.options.map((option) => {
                        row += 1
                        const index = row
                        const activeRow = index === active

                        return (
                          <li
                            key={option.value}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={activeRow}
                            aria-disabled={option.disabled === true || undefined}
                            // Keeping focus out of the list is what lets the
                            // user carry on typing after glancing at it.
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => pick(option)}
                            className={cn(
                              'cursor-pointer truncate rounded-sm px-2 py-1.5 text-sm',
                              activeRow && 'bg-accent text-accent-foreground',
                              option.disabled === true &&
                                'cursor-not-allowed opacity-50'
                            )}
                          >
                            {optionText(option)}
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        {clearable && text !== '' && !disabled && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              setText('')
              setActive(-1)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
AutoComplete.displayName = 'AutoComplete'

export { AutoComplete }
export type { AutoCompleteFilter, AutoCompleteOption }

/** Re-exported so callers can build options without importing the module. */
export { normalizeOptions, optionText }
