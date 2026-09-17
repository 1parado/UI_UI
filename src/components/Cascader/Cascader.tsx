import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
  type CascaderLeafPath,
  type CascaderOption,
  columnsFor,
  explore,
  findOptionPath,
  isLeaf,
  optionLabels,
  searchLeafPaths,
  siblingValue,
} from '@/lib/cascader'
import { ChevronDownIcon, ChevronRightIcon, XIcon } from '@/lib/icons'
import { useControllableState } from '@/lib/use-controllable-state'

const cascaderVariants = cva(
  'inline-flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface CascaderProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children'
    >,
    VariantProps<typeof cascaderVariants> {
  options: CascaderOption[]
  /** Selected chain of ids. Omit to let the picker hold its own state. */
  value?: string[]
  defaultValue?: string[]
  /** Fired with the picked ids and the options they name. */
  onChange?: (value: string[], path: CascaderOption[]) => void
  placeholder?: string
  /** Show a trailing ✕ once something is picked. */
  clearable?: boolean
  /**
   * Let a parent level be an answer. Off by default, where only a leaf counts
   * as a selection and every other click walks one column deeper.
   */
  changeOnSelect?: boolean
  /** Offer a search box that flattens the tree to matching leaves. */
  showSearch?: boolean
  searchPlaceholder?: string
  /** How the picked chain reads on the trigger. Defaults to `" / "`. */
  separator?: string
  emptyText?: string
}

/** Column index + option value — enough to address one row in the panel. */
const keyFor = (column: number, value: string) => `${column}:${value}`

/**
 * Pick one leaf out of a tree, one column per level.
 *
 * Every level is drawn at once rather than replacing its parent, so the
 * position of the current branch stays on screen while you walk it — which is
 * the whole reason to use this over a plain tree select. The values are the
 * ids of a chain (`['zj', 'hz', 'xh']`), because that is what a form value,
 * a URL param and a database row all want to store.
 *
 * Keyboard worth knowing: ↑↓ move inside a column, → opens the focused row's
 * children, ← steps back to its parent, Enter picks, Esc closes.
 *
 * ```tsx
 * <Cascader options={regions} placeholder="Pick a district" clearable />
 * ```
 */
const Cascader = React.forwardRef<HTMLButtonElement, CascaderProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      clearable = false,
      changeOnSelect = false,
      showSearch = false,
      searchPlaceholder = 'Search…',
      separator = ' / ',
      emptyText = 'No options',
      size,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [selected, setSelected] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onValueChange: (next) => onChange?.(next, findOptionPath(options, next)),
    })

    /** Where the columns have walked to. Starts at the picked chain. */
    const [walked, setWalked] = React.useState<string[]>(selected)
    const [query, setQuery] = React.useState('')
    const [focusKey, setFocusKey] = React.useState<string | null>(null)

    const rows = React.useRef(new Map<string, HTMLElement>()).current

    const columns = React.useMemo(() => columnsFor(options, walked), [options, walked])
    const searchResults = React.useMemo(
      () => (query.trim() === '' ? [] : searchLeafPaths(options, query)),
      [options, query]
    )
    const searching = showSearch && query.trim() !== ''
    const label = optionLabels(options, selected, separator)

    // Refocus after keyboard movement. `walked` is a dependency because moving
    // sideways can reveal a row at the same address that did not exist yet.
    React.useEffect(() => {
      if (!focusKey) return
      rows.get(focusKey)?.focus()
    }, [focusKey, walked, rows])

    const openPanel = (next: boolean) => {
      setOpen(next)
      setQuery('')
      setFocusKey(null)
      if (next) setWalked(selected)
    }

    /** Deep enough to answer — or just another step down the branch. */
    const commit = (path: string[], option: CascaderOption) => {
      if (!isLeaf(option) && !changeOnSelect) {
        setWalked(path)
        setFocusKey(null)
        return
      }

      setSelected(path)

      // With `changeOnSelect` a parent is a legal answer, but it is rarely the
      // last one — keep the panel up so the branch below it stays reachable.
      if (!isLeaf(option)) {
        setWalked(path)
        return
      }

      setOpen(false)
      setQuery('')
    }

    const pick = (column: number, option: CascaderOption) => {
      if (option.disabled === true) return
      commit([...walked.slice(0, column), option.value], option)
    }

    const pickPath = (path: CascaderLeafPath) => {
      if (path.disabled) return
      setSelected(path.values)
      setWalked(path.values)
      setOpen(false)
      setQuery('')
    }

    const onRowKeyDown = (
      event: React.KeyboardEvent<HTMLElement>,
      column: number,
      option: CascaderOption
    ) => {
      const siblings = columns[column] ?? []
      const here = [...walked.slice(0, column), option.value]

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          event.preventDefault()
          const next = siblingValue(siblings, option.value, event.key === 'ArrowDown' ? 1 : -1)
          if (next === undefined) return
          setWalked(explore(walked, column, next))
          setFocusKey(keyFor(column, next))
          break
        }
        case 'ArrowRight': {
          const children = option.children ?? []
          if (children.length === 0) return
          event.preventDefault()
          const first = children[0]
          setWalked([...walked.slice(0, column), option.value, first.value])
          setFocusKey(keyFor(column + 1, first.value))
          break
        }
        case 'ArrowLeft': {
          if (column === 0) return
          event.preventDefault()
          const parent = walked[column - 1]
          setWalked(walked.slice(0, column))
          setFocusKey(keyFor(column - 1, parent))
          break
        }
        case 'Enter':
        case ' ': {
          event.preventDefault()
          if (option.disabled === true) return
          commit(here, option)
          break
        }
        default:
          break
      }
    }

    return (
      <div className="relative inline-flex w-full">
        <Popover open={open} onOpenChange={openPanel}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              className={cn(cascaderVariants({ size }), 'pr-8', className)}
              {...props}
            >
              <span
                className={cn('truncate text-left', selected.length === 0 && 'text-muted-foreground')}
              >
                {label === '' ? placeholder : label}
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 shrink-0 opacity-50 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto p-0">
            <div role="listbox" aria-label={props['aria-label'] ?? 'Options'} className="outline-none">
              {showSearch && (
                <div className="border-b border-border p-2">
                  <input
                    type="text"
                    value={query}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}

              {searching ? (
                <ul className="max-h-64 min-w-[14rem] overflow-auto p-1">
                  {searchResults.length === 0 && (
                    <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                      {emptyText}
                    </li>
                  )}
                  {searchResults.map((path) => (
                    <li key={path.values.join('/')}>
                      <div
                        role="option"
                        aria-selected={path.values.join('/') === selected.join('/')}
                        aria-disabled={path.disabled || undefined}
                        tabIndex={path.disabled ? -1 : 0}
                        onClick={() => pickPath(path)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return
                          event.preventDefault()
                          pickPath(path)
                        }}
                        className={cn(
                          'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent',
                          path.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                        )}
                      >
                        {path.labels.join(separator)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex max-h-72 overflow-hidden">
                  {columns.map((column, columnIndex) => (
                    <ul
                      key={columnIndex}
                      role="group"
                      aria-label={
                        columnIndex === 0
                          ? 'Options'
                          : (findOptionPath(options, walked)[columnIndex - 1]?.label ?? 'Options')
                      }
                      className="min-w-[9rem] max-h-72 overflow-auto border-l border-border p-1 first:border-l-0"
                    >
                      {column.length === 0 && (
                        <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                          {emptyText}
                        </li>
                      )}
                      {column.map((option) => {
                        const active = walked[columnIndex] === option.value
                        const picked = selected[columnIndex] === option.value
                        const hasChildren = !isLeaf(option)

                        return (
                          <li key={option.value}>
                            <div
                              role="option"
                              aria-selected={picked}
                              aria-expanded={hasChildren || undefined}
                              aria-disabled={option.disabled === true || undefined}
                              tabIndex={
                                option.disabled === true
                                  ? -1
                                  : focusKey
                                    ? keyFor(columnIndex, option.value) === focusKey
                                      ? 0
                                      : -1
                                    : columnIndex === 0 &&
                                        option.value === (walked[0] ?? column[0]?.value)
                                      ? 0
                                      : -1
                              }
                              ref={(node) => {
                                const address = keyFor(columnIndex, option.value)
                                if (node) rows.set(address, node)
                                else rows.delete(address)
                              }}
                              onClick={() => pick(columnIndex, option)}
                              onKeyDown={(event) => onRowKeyDown(event, columnIndex, option)}
                              className={cn(
                                'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground',
                                active && 'bg-accent text-accent-foreground',
                                picked && !active && 'font-medium',
                                option.disabled === true &&
                                  'cursor-not-allowed opacity-50 hover:bg-transparent'
                              )}
                            >
                              <span className="truncate">{option.label}</span>
                              {hasChildren ? (
                                <ChevronRightIcon
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5 shrink-0 opacity-60"
                                />
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {clearable && selected.length > 0 && !disabled ? (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              setSelected([])
              setWalked([])
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    )
  }
)
Cascader.displayName = 'Cascader'

export { Cascader, cascaderVariants }
