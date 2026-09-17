import * as React from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/Checkbox'
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/icons'
import {
  type TransferDirection,
  type TransferItem,
  toggleSelectAll,
  panelSummary,
  partitionItems,
  selectAllState,
  selectableKeys,
  filterItems,
  targetKeysAfterMove,
} from '@/lib/transfer'
import { useControllableState } from '@/lib/use-controllable-state'

export interface TransferProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'children'
  > {
  /** Every row that exists. Which side it sits on comes from `targetKeys`. */
  dataSource: TransferItem[]
  /** Keys on the right. Omit to let the component hold them. */
  targetKeys?: string[]
  defaultTargetKeys?: string[]
  onChange?: (
    nextTargetKeys: string[],
    direction: TransferDirection,
    movedKeys: string[]
  ) => void
  /** Panel headings, source then target. */
  titles?: [React.ReactNode, React.ReactNode]
  searchable?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  showSelectAll?: boolean
  /** Height of the scrolling row list, passed straight to CSS. */
  listHeight?: string
  /** Override how a query matches a row. */
  filterOption?: (query: string, item: TransferItem) => boolean
  /** Draw a row's body yourself. */
  renderItem?: (item: TransferItem) => React.ReactNode
  emptyText?: React.ReactNode
}

interface PanelProps {
  title: React.ReactNode
  items: TransferItem[]
  checked: string[]
  onToggle: (key: string) => void
  onToggleAll: () => void
  disabled: boolean
  searchable: boolean
  query: string
  onQueryChange: (query: string) => void
  searchPlaceholder: string
  showSelectAll: boolean
  listHeight: string
  emptyText: React.ReactNode
  renderItem?: (item: TransferItem) => React.ReactNode
  summary: { selected: number; total: number }
}

function TransferPanel({
  title,
  items,
  checked,
  onToggle,
  onToggleAll,
  disabled,
  searchable,
  query,
  onQueryChange,
  searchPlaceholder,
  showSelectAll,
  listHeight,
  emptyText,
  renderItem,
  summary,
}: PanelProps) {
  const all = selectAllState(items, checked)

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-md border border-border">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {showSelectAll && (
          <Checkbox
            aria-label={`Select all rows in ${typeof title === 'string' ? title : 'this panel'}`}
            checked={all === 'all' ? true : all === 'some' ? 'indeterminate' : false}
            disabled={disabled || selectableKeys(items).length === 0}
            onCheckedChange={onToggleAll}
          />
        )}
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
          {summary.selected}/{summary.total}
        </span>
      </div>

      {searchable && (
        <div className="border-b border-border p-2">
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            disabled={disabled}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-1" style={{ maxHeight: listHeight }}>
        {items.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              className={cn(
                'flex items-start gap-2 rounded-sm px-2 py-1.5 text-sm',
                item.disabled !== true && 'cursor-pointer hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Checkbox
                aria-label={item.title}
                checked={checked.includes(item.key)}
                disabled={disabled || item.disabled === true}
                onCheckedChange={() => onToggle(item.key)}
                className="mt-0.5"
              />
              <span
                className="min-w-0 flex-1"
                onClick={() => {
                  if (disabled || item.disabled === true) return
                  onToggle(item.key)
                }}
              >
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <span className="block truncate">{item.title}</span>
                    {item.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Two lists and the gap between them.
 *
 * Only *which keys are on the right* is state; both panels are derived from
 * that, which is why a caller can persist `targetKeys` straight to a server and
 * hand it back later. Rows are ticked independently on each side, so a search
 * on one panel never disturbs the other.
 *
 * ```tsx
 * <Transfer dataSource={people} targetKeys={onTeam} onChange={setOnTeam} searchable />
 * ```
 */
const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  (
    {
      dataSource,
      targetKeys,
      defaultTargetKeys,
      onChange,
      titles = ['Source', 'Target'],
      searchable = true,
      searchPlaceholder = 'Search…',
      disabled = false,
      showSelectAll = true,
      listHeight = '16rem',
      filterOption,
      renderItem,
      emptyText = 'Nothing here',
      className,
      ...props
    },
    ref
  ) => {
    const [target, setTarget] = useControllableState<string[]>({
      value: targetKeys,
      defaultValue: defaultTargetKeys ?? [],
    })

    const [sourceQuery, setSourceQuery] = React.useState('')
    const [targetQuery, setTargetQuery] = React.useState('')
    const [sourceChecked, setSourceChecked] = React.useState<string[]>([])
    const [targetChecked, setTargetChecked] = React.useState<string[]>([])

    const [sourceItems, targetItems] = partitionItems(dataSource, target)
    const visibleSource = filterItems(sourceItems, sourceQuery, filterOption)
    const visibleTarget = filterItems(targetItems, targetQuery, filterOption)

    const move = (direction: TransferDirection) => {
      const moving = direction === 'to-target' ? sourceChecked : targetChecked
      if (moving.length === 0) return

      const next = targetKeysAfterMove(target, moving, direction)
      setTarget(next)
      onChange?.(next, direction, moving)

      if (direction === 'to-target') setSourceChecked([])
      else setTargetChecked([])
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center',
          className
        )}
        {...props}
      >
        <TransferPanel
          title={titles[0]}
          items={visibleSource}
          checked={sourceChecked}
          disabled={disabled}
          onToggle={(key) =>
            setSourceChecked((current) =>
              current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key]
            )
          }
          onToggleAll={() =>
            setSourceChecked((current) => toggleSelectAll(visibleSource, current))
          }
          searchable={searchable}
          query={sourceQuery}
          onQueryChange={setSourceQuery}
          searchPlaceholder={searchPlaceholder}
          showSelectAll={showSelectAll}
          listHeight={listHeight}
          emptyText={emptyText}
          renderItem={renderItem}
          summary={panelSummary(visibleSource, sourceChecked)}
        />

        <div className="flex shrink-0 items-center justify-center gap-2 sm:flex-col">
          <button
            type="button"
            aria-label="Move selected to target"
            disabled={disabled || sourceChecked.length === 0}
            onClick={() => move('to-target')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move selected to source"
            disabled={disabled || targetChecked.length === 0}
            onClick={() => move('to-source')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <TransferPanel
          title={titles[1]}
          items={visibleTarget}
          checked={targetChecked}
          disabled={disabled}
          onToggle={(key) =>
            setTargetChecked((current) =>
              current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key]
            )
          }
          onToggleAll={() =>
            setTargetChecked((current) => toggleSelectAll(visibleTarget, current))
          }
          searchable={searchable}
          query={targetQuery}
          onQueryChange={setTargetQuery}
          searchPlaceholder={searchPlaceholder}
          showSelectAll={showSelectAll}
          listHeight={listHeight}
          emptyText={emptyText}
          renderItem={renderItem}
          summary={panelSummary(visibleTarget, targetChecked)}
        />
      </div>
    )
  }
)
Transfer.displayName = 'Transfer'

export { Transfer }
