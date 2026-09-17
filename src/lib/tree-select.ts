import type * as React from 'react'

/**
 * Tree selection arithmetic — flattening, filtering and check cascades.
 *
 * The node shape mirrors the one `Tree` renders (`id`, `label`, `children`),
 * so a tree already built for `<Tree>` drops straight into `<TreeSelect>`.
 */

export interface TreeSelectNode {
  id: string
  label: React.ReactNode
  children?: TreeSelectNode[]
  disabled?: boolean
  /** Open on the first render. */
  defaultExpanded?: boolean
  [key: string]: unknown
}

export interface TreeRow {
  node: TreeSelectNode
  level: number
  parentId?: string
  hasChildren: boolean
  expanded: boolean
}

/**
 * Searchable text for a row. Only string labels can be matched — a node whose
 * label is JSX has nothing to search, though its children can still pull it
 * into the filtered tree.
 */
export function nodeText(node: TreeSelectNode): string {
  return typeof node.label === 'string' ? node.label : ''
}

/** Depth-first walk of what is on screen: expanded children only. */
export function visibleRows(
  nodes: TreeSelectNode[],
  expandedIds: string[],
  level = 1,
  parentId?: string
): TreeRow[] {
  const rows: TreeRow[] = []

  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length)
    const expanded = hasChildren && expandedIds.includes(node.id)

    rows.push({ node, level, parentId, hasChildren, expanded })

    if (expanded && node.children) {
      rows.push(...visibleRows(node.children, expandedIds, level + 1, node.id))
    }
  }

  return rows
}

export function findNode(
  nodes: TreeSelectNode[],
  id: string
): TreeSelectNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const deeper = findNode(node.children ?? [], id)
    if (deeper) return deeper
  }

  return undefined
}

/** Node ids in the order asked for, skipping ids the tree does not hold. */
export function nodesFor(nodes: TreeSelectNode[], ids: string[]): TreeSelectNode[] {
  return ids
    .map((id) => findNode(nodes, id))
    .filter((node): node is TreeSelectNode => node !== undefined)
}

/** String labels for the selected ids — JSX labels come back empty. */
export function labelsFor(nodes: TreeSelectNode[], ids: string[]): string[] {
  return nodesFor(nodes, ids).map((node) => nodeText(node))
}

/** A node and everything under it, in reading order. */
export function branchIds(node: TreeSelectNode): string[] {
  const ids = [node.id]

  for (const child of node.children ?? []) {
    ids.push(...branchIds(child))
  }

  return ids
}

/** Same as `branchIds`, but resolved from the root by id. */
export function branchIdsFor(nodes: TreeSelectNode[], id: string): string[] {
  const node = findNode(nodes, id)
  return node ? branchIds(node) : []
}

/** Every expandable id, which is what "expand all" means. */
export function allExpandedIds(nodes: TreeSelectNode[]): string[] {
  const ids: string[] = []

  const walk = (level: TreeSelectNode[]) => {
    for (const node of level) {
      if (!node.children?.length) continue
      ids.push(node.id)
      walk(node.children)
    }
  }

  walk(nodes)
  return ids
}

export function defaultExpandedIds(nodes: TreeSelectNode[]): string[] {
  const ids: string[] = []

  const walk = (level: TreeSelectNode[]) => {
    for (const node of level) {
      if (!node.children?.length) continue
      if (node.defaultExpanded === true) ids.push(node.id)
      walk(node.children)
    }
  }

  walk(nodes)
  return ids
}

/**
 * Checking a node checks its whole branch, and unchecking takes the branch
 * with it — the cascade people expect from a tree. Because a parent can be
 * ticked while only some children are, `nodeState` below is how the boxes get
 * drawn; the value list itself stays flat.
 */
export function applyToggle(
  values: string[],
  branch: string[],
  shouldCheck: boolean
): string[] {
  const set = new Set(values)

  for (const id of branch) {
    if (shouldCheck) set.add(id)
    else set.delete(id)
  }

  return [...set]
}

export type CheckedState = 'checked' | 'unchecked' | 'partial'

/**
 * How one box should look given the flat value list: every id in the branch
 * ticked, none of them, or somewhere in between.
 */
export function nodeState(
  nodes: TreeSelectNode[],
  id: string,
  values: string[]
): CheckedState {
  const branch = branchIdsFor(nodes, id)
  if (branch.length === 0) return 'unchecked'

  const ticked = branch.filter((branchId) => values.includes(branchId)).length
  if (ticked === 0) return 'unchecked'
  if (ticked === branch.length) return 'checked'
  return 'partial'
}

/**
 * Prune the tree down to what a search query can reach.
 *
 * A node survives if it matches, if anything under it matches, or if it sits
 * on the path to something that does — losing the path would leave the user
 * looking at a stray leaf with no idea where it hangs.
 */
export function filterTree(nodes: TreeSelectNode[], query: string): TreeSelectNode[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return nodes

  const matches = (node: TreeSelectNode) => nodeText(node).toLowerCase().includes(needle)

  const keep = (level: TreeSelectNode[]): TreeSelectNode[] =>
    level.reduce<TreeSelectNode[]>((survivors, node) => {
      const children = node.children ? keep(node.children) : []

      if (matches(node)) {
        // A matching folder brings its own subtree along — filtering by "src"
        // should not hide what is inside src.
        survivors.push(node)
      } else if (children.length > 0) {
        survivors.push({ ...node, children })
      }

      return survivors
    }, [])

  return keep(nodes)
}
