import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  useControllableString,
  useControllableStringArray,
} from '@/lib/use-controllable-state'
import { ChevronRightIcon } from '@/lib/icons'

export interface TreeNode {
  id: string
  label: React.ReactNode
  children?: TreeNode[]
  /** Drawn before the label. Falls back to the disclosure chevron alone. */
  icon?: React.ReactNode
  disabled?: boolean
  /** Open on the first render, unless the caller owns `expandedIds`. */
  defaultExpanded?: boolean
  /** Any extra data the caller wants back in `onSelect`. */
  [key: string]: unknown
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  nodes: TreeNode[]
  /** Own the open set, or let the component hold it with `defaultExpandedIds`. */
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Own the selection, or let the component hold it. */
  selectedId?: string
  defaultSelectedId?: string
  onSelectedChange?: (id: string) => void
  onSelect?: (node: TreeNode) => void
  /** Selecting a folder opens it too. Defaults to `true`. */
  expandOnSelect?: boolean
  renderIcon?: (node: TreeNode, expanded: boolean) => React.ReactNode
  /** Accessible name for the tree. */
  label?: string
}

interface FlatItem {
  node: TreeNode
  level: number
  parentId?: string
  hasChildren: boolean
  expanded: boolean
  posinset: number
  setsize: number
}

/** Depth-first walk of what is currently visible. */
function flatten(
  nodes: TreeNode[],
  expandedIds: string[],
  level = 1,
  parentId?: string
): FlatItem[] {
  const out: FlatItem[] = []

  nodes.forEach((node, index) => {
    const hasChildren = Boolean(node.children?.length)
    const expanded = hasChildren && expandedIds.includes(node.id)

    out.push({
      node,
      level,
      parentId,
      hasChildren,
      expanded,
      posinset: index + 1,
      setsize: nodes.length,
    })

    if (expanded && node.children) out.push(...flatten(node.children, expandedIds, level + 1, node.id))
  })

  return out
}

function collectDefaultExpanded(nodes: TreeNode[]): string[] {
  const out: string[] = []

  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.defaultExpanded) out.push(node.id)
      if (node.children) walk(node.children)
    }
  }

  walk(nodes)
  return out
}

/**
 * A tree view: files, agent steps, nested settings — anything where a row can
 * contain rows.
 *
 * Three decisions worth knowing:
 *
 * - **The list is flattened.** Every visible row is a sibling `<li>` carrying
 *   `aria-level`, rather than nesting `<ul role="group">` inside each other.
 *   The ARIA spec allows both, and a flat list is what makes the roving
 *   tabindex and the arrow keys a single index walk instead of a tree of refs.
 * - **One tab stop.** Only the active row is focusable; arrows move the active
 *   row and the focus with it, which is the `role="tree"` contract.
 * - **Selecting a folder also opens it.** One click instead of two, matching
 *   every file explorer. Set `expandOnSelect={false}` for a picker where the
 *   selection is the only thing that matters.
 *
 * ```tsx
 * <Tree
 *   label="Repository"
 *   nodes={[
 *     { id: 'src', label: 'src', children: [{ id: 'src/index.ts', label: 'index.ts' }] },
 *   ]}
 *   onSelect={(node) => setFile(node.id)}
 * />
 * ```
 */
const Tree = React.forwardRef<HTMLUListElement, TreeProps>(
  (
    {
      className,
      nodes,
      expandedIds,
      defaultExpandedIds,
      onExpandedChange,
      selectedId,
      defaultSelectedId,
      onSelectedChange,
      onSelect,
      expandOnSelect = true,
      renderIcon,
      label,
      ...props
    },
    ref
  ) => {
    const fallbackExpanded = React.useMemo(() => collectDefaultExpanded(nodes), [nodes])

    const [open, setOpen] = useControllableStringArray({
      value: expandedIds,
      defaultValue: defaultExpandedIds ?? fallbackExpanded,
      onValueChange: onExpandedChange,
    })

    const [selected, setSelected] = useControllableString({
      value: selectedId,
      defaultValue: defaultSelectedId,
      onValueChange: onSelectedChange,
    })

    const flat = React.useMemo(() => flatten(nodes, open), [nodes, open])

    const [activeId, setActiveId] = React.useState<string | null>(null)
    const firstEnabled = flat.find((item) => !item.node.disabled)?.node.id ?? null
    const candidate = activeId ?? (selected || firstEnabled)
    // The candidate can be a node that a collapse has just hidden, so it is
    // only used when it is actually on screen.
    const active = flat.some((item) => item.node.id === candidate) ? candidate : firstEnabled

    const itemRefs = React.useRef(new Map<string, HTMLLIElement>())
    /**
     * A counter rather than a boolean: two moves in a row can land on the same
     * active id (leaving a child for its parent when the parent is already the
     * fallback tab stop), and a boolean would have been reset by the first run
     * and never re-fired, leaving the focus behind.
     */
    const [focusRequest, setFocusRequest] = React.useState(0)

    const move = (id: string) => {
      setActiveId(id)
      setFocusRequest((count) => count + 1)
    }

    React.useEffect(() => {
      if (focusRequest === 0) return
      itemRefs.current.get(active ?? '')?.focus()
    }, [focusRequest, active, flat])

    // A controlled collapse can hide the active row: fall back to whatever is
    // visible rather than leaving the tab stop on a node that is not rendered.
    React.useEffect(() => {
      if (activeId && !flat.some((item) => item.node.id === activeId)) setActiveId(null)
    }, [flat, activeId])

    const toggle = (id: string) =>
      setOpen(open.includes(id) ? open.filter((entry) => entry !== id) : [...open, id])

    const indexOf = (id: string | null) => flat.findIndex((item) => item.node.id === id)

    const step = (from: number, direction: 1 | -1) => {
      for (let index = from + direction; index >= 0 && index < flat.length; index += direction) {
        if (!flat[index].node.disabled) return index
      }
      return -1
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      // The key acts on the row that has focus, not on the component's idea of
      // "active": focus can arrive from outside (a programmatic `focus()`, a
      // browser restoring it, a test) and the two are then allowed to differ.
      const focused = (event.target as HTMLElement | null)?.closest('[data-node-id]')
      const currentId = focused?.getAttribute('data-node-id') ?? active
      const index = indexOf(currentId)
      if (index === -1) return
      const item = flat[index]
      let next: number | null = null

      switch (event.key) {
        case 'ArrowDown':
          next = step(index, 1)
          break
        case 'ArrowUp':
          next = step(index, -1)
          break
        case 'Home':
          next = flat.findIndex((entry) => !entry.node.disabled)
          break
        case 'End': {
          const reversed = [...flat].reverse().findIndex((entry) => !entry.node.disabled)
          next = reversed === -1 ? -1 : flat.length - 1 - reversed
          break
        }
        case 'ArrowRight':
          if (item.hasChildren && !item.expanded) toggle(item.node.id)
          else if (item.expanded) next = step(index, 1)
          else return
          break
        case 'ArrowLeft':
          if (item.hasChildren && item.expanded) toggle(item.node.id)
          else if (item.parentId) next = indexOf(item.parentId)
          else return
          break
        case 'Enter':
        case ' ':
          if (item.node.disabled) return
          setSelected(item.node.id)
          onSelect?.(item.node)
          if (item.hasChildren && expandOnSelect) toggle(item.node.id)
          break
        default:
          return
      }

      event.preventDefault()
      if (next !== null && next >= 0) move(flat[next].node.id)
    }

    const handleClick = (item: FlatItem) => {
      if (item.node.disabled) return
      setActiveId(item.node.id)
      setSelected(item.node.id)
      onSelect?.(item.node)
      if (item.hasChildren && expandOnSelect) toggle(item.node.id)
    }

    return (
      <ul
        ref={ref}
        role="tree"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn('select-none text-sm', className)}
        {...props}
      >
        {flat.map((item) => {
          const isSelected = selected === item.node.id

          return (
            <li
              key={item.node.id}
              ref={(element) => {
                if (element) itemRefs.current.set(item.node.id, element)
                else itemRefs.current.delete(item.node.id)
              }}
              role="treeitem"
              data-node-id={item.node.id}
              tabIndex={active === item.node.id ? 0 : -1}
              aria-level={item.level}
              aria-posinset={item.posinset}
              aria-setsize={item.setsize}
              aria-selected={isSelected}
              aria-expanded={item.hasChildren ? item.expanded : undefined}
              aria-disabled={item.node.disabled || undefined}
              onClick={() => handleClick(item)}
              style={{ paddingLeft: `${(item.level - 1) * 14 + 6}px` }}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-sm py-1 pr-2',
                'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                item.node.disabled && 'cursor-not-allowed text-muted-foreground opacity-60'
              )}
            >
              {item.hasChildren ? (
                <ChevronRightIcon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                    item.expanded && 'rotate-90'
                  )}
                />
              ) : (
                <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              )}

              {renderIcon && (
                <span aria-hidden="true" className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">
                  {renderIcon(item.node, item.expanded)}
                </span>
              )}

              <span className="min-w-0 truncate">{item.node.label}</span>
            </li>
          )
        })}
      </ul>
    )
  }
)
Tree.displayName = 'Tree'

export { Tree }
