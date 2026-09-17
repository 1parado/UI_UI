import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  buildFileTree,
  collectDirectoryIds,
  type FileKind,
  type FileTreeEntry,
} from '@/lib/file-tree'
import { Tree, type TreeNode, type TreeProps } from '@/components/Tree/Tree'
import { FileIcon, FolderIcon, FolderOpenIcon } from '@/lib/icons'

interface FileTreeNode extends TreeNode {
  kind: FileKind
}

export interface FileTreeProps
  extends Omit<TreeProps, 'nodes' | 'renderIcon' | 'defaultExpandedIds'> {
  /** Paths to show. Nesting is derived from the separators. */
  paths: string[]
  /** Prefix stripped from every path, so the root is not repeated as a level. */
  root?: string
  /** Open every folder on the first render. Defaults to `true`. */
  defaultExpanded?: boolean
  /** A bar above the tree — a repository name, a filter, a count. */
  header?: React.ReactNode
  /** Shown when there is nothing to list. */
  emptyMessage?: string
}

const toNodes = (entries: FileTreeEntry[]): FileTreeNode[] =>
  entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    kind: entry.kind,
    children: entry.children ? toNodes(entry.children) : undefined,
  }))

const iconFor = (node: TreeNode, expanded: boolean) => {
  const { kind } = node as FileTreeNode
  if (kind === 'folder') return expanded ? <FolderOpenIcon /> : <FolderIcon />
  return <FileIcon />
}

/**
 * A tree of file paths — the shape a listing, a patch or a grep result arrives
 * in. `Tree` does the interaction; this maps paths to nodes, picks an icon per
 * kind and draws the card around it.
 *
 * ```tsx
 * <FileTree
 *   header="UI_UI"
 *   paths={['src/index.ts', 'src/components/Button/Button.tsx', 'README.md']}
 *   onSelect={(node) => open(node.id)}
 * />
 * ```
 */
const FileTree = React.forwardRef<HTMLUListElement, FileTreeProps>(
  (
    {
      className,
      paths,
      root,
      defaultExpanded = true,
      header,
      emptyMessage = 'No files',
      label = 'Files',
      ...props
    },
    ref
  ) => {
    const entries = React.useMemo(() => buildFileTree(paths, { root }), [paths, root])
    const nodes = React.useMemo(() => toNodes(entries), [entries])
    const expandedIds = React.useMemo(
      () => (defaultExpanded ? collectDirectoryIds(entries) : []),
      [entries, defaultExpanded]
    )

    return (
      <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
        {header && (
          <div className="border-b border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {header}
          </div>
        )}

        {entries.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="p-1">
            <Tree
              ref={ref}
              nodes={nodes}
              label={label}
              renderIcon={iconFor}
              defaultExpandedIds={expandedIds}
              {...props}
            />
          </div>
        )}
      </div>
    )
  }
)
FileTree.displayName = 'FileTree'

export { FileTree }
