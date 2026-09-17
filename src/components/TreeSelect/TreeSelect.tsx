import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
  type CheckedState,
  type TreeRow,
  type TreeSelectNode,
  allExpandedIds,
  applyToggle,
  branchIds,
  defaultExpandedIds,
  filterTree,
  labelsFor,
  nodeState,
  nodesFor,
  visibleRows,
} from '@/lib/tree-select'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, MinusIcon, XIcon } from '@/lib/icons'
import { useControllableState } from '@/lib/use-controllable-state'

const treeSelectVariants = cva(
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

interface TreeSelectBaseProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children'
  >,
    VariantProps<typeof treeSelectVariants> {
  /** Same node shape `Tree` takes, so one tree feeds both. */
  treeData: TreeSelectNode[]
  /** Checkboxes instead of a single answer. */
  multiple?: boolean
  /**
   * Both forms arrive the same channel: an array when `multiple`, otherwise a
   * single id (empty string when nothing is picked). The second argument is
   * always the picked nodes, in picking order.
   */
  onChange?: (value: string | string[], nodes: TreeSelectNode[]) => void
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  /** Open every folder on the first render. */
  defaultExpandAll?: boolean
  /** Leave the panel up after picking, for several answers in a row. */
  keepOpenOnSelect?: boolean
  emptyText?: string
  maxHeight?: string
}

export interface TreeSelectProps extends TreeSelectBaseProps {
  value?: string | string[]
  defaultValue?: string | string[]
}

const toArray = (value: string | string[] | undefined): string[] => {
  if (value === undefined) return []
  return Array.isArray(value) ? value : value === '' ? [] : [value]
}

/** The little box on each row. Decorative: the row carries `aria-checked`. */
function CheckMark({ state }: { state: CheckedState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
        state === 'unchecked' && 'border-input',
        state !== 'unchecked' && 'bg-primary text-primary-foreground'
      )}
    >
      {state === 'checked' && <CheckIcon className="h-3 w-3" />}
      {state === 'partial' && <MinusIcon className="h-3 w-3" />}
    </span>
  )
}

/**
 * Pick out of a tree, from a button-sized box.
 *
 * `Tree` is for trees that live on the page; this is the same data in a
 * dropdown, where the box has to stay one line high. Selecting follows the
 * cascade people expect from a tree: ticking a folder ticks everything under
 * it, unticking takes the branch away, and a folder holding one ticked child
 * draws a dash rather than a tick. Values stay flat — a list of ids — because
 * that is what a form value wants, and `nodeState` derives the rest.
 *
 * Nodes accept the same shape `Tree` renders, so `<Tree data={x} />` and
 * `<TreeSelect treeData={x} multiple />` can share one tree.
 *
 * ```tsx
 * <TreeSelect treeData={files} multiple placeholder="Pick a few files" />
 * ```
 */
const TreeSelect = React.forwardRef<HTMLButtonElement, TreeSelectProps>(
  (
    {
      treeData,
      multiple = false,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      clearable = false,
      showSearch = true,
      searchPlaceholder = 'Search…',
      defaultExpandAll = false,
      keepOpenOnSelect = false,
      emptyText = 'No matches',
      maxHeight = '18rem',
      size,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [selected, setSelected] = useControllableState<string[]>({
      // Normalising `undefined` away would make every instance look controlled,
      // so the ownership test has to happen before the array conversion.
      value: value === undefined ? undefined : toArray(value),
      defaultValue: toArray(defaultValue),
      onValueChange: (next) => {
        const nodes = nodesFor(treeData, next)
        onChange?.(multiple ? next : (next[0] ?? ''), nodes)
      },
    })

    const [expanded, setExpanded] = React.useState<string[]>(() =>
      defaultExpandAll ? allExpandedIds(treeData) : defaultExpandedIds(treeData)
    )

    const data = React.useMemo(
      () => (showSearch && query.trim() !== '' ? filterTree(treeData, query) : treeData),
      [showSearch, query, treeData]
    )

    // A filtered tree is already pruned to what matches, so keeping it folded
    // would hide the answer the user just typed towards.
    const rows: TreeRow[] = React.useMemo(
      () =>
        visibleRows(
          data,
          query.trim() !== '' ? allExpandedIds(data) : expanded
        ),
      [data, expanded, query]
    )

    const rowRefs = React.useRef(new Map<string, HTMLElement>()).current
    const [activeId, setActiveId] = React.useState<string | null>(null)

    React.useEffect(() => {
      if (!activeId) return
      rowRefs.get(activeId)?.focus()
    }, [activeId, rows, rowRefs])

    const toggleExpanded = (id: string) =>
      setExpanded((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      )

    const select = (node: TreeSelectNode) => {
      if (node.disabled === true) return

      // Single answer, folders are waypoints: clicking one opens it rather
      // than answering "all of src", which nobody reading the trigger would
      // guess. In multiple mode a folder *is* an answer — "this branch" — so
      // clicking keeps its meaning and the chevron stays the way to open it.
      if (!multiple && node.children?.length) {
        toggleExpanded(node.id)
        return
      }

      if (!multiple) {
        setSelected([node.id])
        if (!keepOpenOnSelect) setOpen(false)
        return
      }

      setSelected(
        applyToggle(selected, branchIds(node), !selected.includes(node.id))
      )
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (rows.length === 0) return

      const index = Math.max(
        0,
        rows.findIndex((row) => row.node.id === activeId)
      )
      const row = rows[index]

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActiveId(rows[Math.min(index + 1, rows.length - 1)].node.id)
          break
        case 'ArrowUp':
          event.preventDefault()
          setActiveId(rows[Math.max(index - 1, 0)].node.id)
          break
        case 'ArrowRight':
          event.preventDefault()
          if (!row.expanded) toggleExpanded(row.node.id)
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (row.expanded) toggleExpanded(row.node.id)
          else if (row.parentId) setActiveId(row.parentId)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          select(row.node)
          break
        default:
          break
      }
    }

    const chips = labelsFor(treeData, selected)
    const showClear = clearable && selected.length > 0 && !disabled

    return (
      <div className="relative inline-flex w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              role="combobox"
              aria-expanded={open}
              aria-haspopup="tree"
              className={cn(treeSelectVariants({ size }), 'pr-8', className)}
              {...props}
            >
              <span
                className={cn(
                  'flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left',
                  selected.length === 0 && 'text-muted-foreground'
                )}
              >
                {chips.length === 0 ? (
                  <span className="truncate">{placeholder}</span>
                ) : multiple ? (
                  chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex max-w-full items-center truncate rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {chip}
                    </span>
                  ))
                ) : (
                  <span className="truncate">
                    {chips[chips.length - 1] || 'Selected'}
                  </span>
                )}
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

          <PopoverContent
            align="start"
            className="p-0"
            style={{ width: 'var(--radix-popover-trigger-width, 16rem)' }}
          >
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

            <div
              role="tree"
              aria-multiselectable={multiple}
              aria-label={props['aria-label'] ?? 'Options'}
              onKeyDown={onKeyDown}
              className="overflow-auto p-1"
              style={{ maxHeight }}
            >
              {rows.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </p>
              )}

              {rows.map((row) => {
                const state = multiple
                  ? nodeState(treeData, row.node.id, selected)
                  : selected.includes(row.node.id)
                    ? 'checked'
                    : 'unchecked'

                return (
                  <div
                    key={row.node.id}
                    role="treeitem"
                    aria-level={row.level}
                    aria-selected={selected.includes(row.node.id)}
                    aria-checked={state === 'unchecked' ? false : state === 'checked' ? true : 'mixed'}
                    aria-expanded={row.hasChildren ? row.expanded : undefined}
                    aria-disabled={row.node.disabled === true || undefined}
                    tabIndex={
                      activeId === row.node.id ||
                      (activeId === null && row === rows[0])
                        ? 0
                        : -1
                    }
                    ref={(node) => {
                      if (node) rowRefs.set(row.node.id, node)
                      else rowRefs.delete(row.node.id)
                    }}
                    onClick={() => select(row.node)}
                    onFocus={() => setActiveId(row.node.id)}
                    style={{ paddingInlineStart: `${(row.level - 1) * 1 + 0.5}rem` }}
                    className={cn(
                      'flex cursor-pointer select-none items-center gap-1.5 rounded-sm py-1.5 pr-2 text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                      selected.includes(row.node.id) && 'font-medium',
                      row.node.disabled === true &&
                        'cursor-not-allowed opacity-50 hover:bg-transparent'
                    )}
                  >
                    <span
                      role="presentation"
                      onClick={
                        row.hasChildren
                          ? (event) => {
                              event.stopPropagation()
                              toggleExpanded(row.node.id)
                            }
                          : undefined
                      }
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
                        row.hasChildren
                          ? 'cursor-pointer hover:text-foreground'
                          : 'opacity-0'
                      )}
                    >
                      <ChevronRightIcon
                        aria-hidden="true"
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          row.expanded && 'rotate-90'
                        )}
                      />
                    </span>

                    {multiple && <CheckMark state={state} />}

                    <span className="truncate">{row.node.label}</span>
                  </div>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {showClear && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => setSelected([])}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
TreeSelect.displayName = 'TreeSelect'

export { TreeSelect, treeSelectVariants }
