/**
 * Turning a flat list of paths into a tree — what `FileTree` renders.
 *
 * Kept apart from the component because it is the part worth testing on its
 * own: a list of paths from an agent run (a patch, a grep result, a repo
 * listing) is the input this library's consumers actually have.
 */

export type FileKind = 'folder' | 'code' | 'data' | 'image' | 'doc' | 'archive' | 'file'

export interface FileTreeEntry {
  /** Path from the root of the tree, `/`-separated. Stable across calls. */
  id: string
  /** Last path segment. */
  label: string
  /** Extension without the dot, lowercased. Empty for folders and dotfiles. */
  extension: string
  kind: FileKind
  children?: FileTreeEntry[]
}

const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'java', 'kt',
  'swift', 'c', 'h', 'cc', 'cpp', 'hpp', 'cs', 'php', 'sh', 'bash', 'zsh',
  'sql', 'vue', 'svelte', 'astro', 'scss', 'less', 'html', 'htm', 'xml', 'toml', 'ini',
])

const DATA_EXTENSIONS = new Set(['json', 'yaml', 'yml', 'csv', 'tsv', 'lock', 'env', 'config'])

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'bmp'])

const DOC_EXTENSIONS = new Set(['md', 'mdx', 'txt', 'rst', 'pdf', 'doc', 'docx'])

const ARCHIVE_EXTENSIONS = new Set(['zip', 'gz', 'tgz', 'tar', 'bz2', 'xz', '7z', 'rar'])

/** `"a/b/App.tsx"` → `"tsx"`. Dotfiles like `.gitignore` have no extension. */
export function fileExtension(path: string): string {
  const name = path.split('/').pop() ?? ''
  const dot = name.lastIndexOf('.')

  if (dot <= 0) return ''
  return name.slice(dot + 1).toLowerCase()
}

/**
 * What a leaf holds. Extension-driven on purpose: a *name* is not evidence
 * (`src` is a folder in one repo and a binary in the next), so the tree decides
 * directories structurally and this only classifies their contents.
 */
export function fileKind(extension: string, directory = false): FileKind {
  if (directory) return 'folder'
  if (CODE_EXTENSIONS.has(extension)) return 'code'
  if (DATA_EXTENSIONS.has(extension)) return 'data'
  if (IMAGE_EXTENSIONS.has(extension)) return 'image'
  if (DOC_EXTENSIONS.has(extension)) return 'doc'
  if (ARCHIVE_EXTENSIONS.has(extension)) return 'archive'
  return 'file'
}

/** `"src\\components/"` → `["src", "components"]`. */
export function splitPath(path: string): string[] {
  return path
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

export interface BuildFileTreeOptions {
  /**
   * Prefix to strip from every path before building. Use it when the caller
   * already prints the root elsewhere and does not want it repeated as the
   * first level.
   */
  root?: string
}

/**
 * Build a sorted tree from paths. Directories come before files, both
 * alphabetically; a path that is also a prefix of another (`src/a.ts` and
 * `src`) becomes an entry with children rather than two entries.
 *
 * ```ts
 * buildFileTree(['src/index.ts', 'src/lib/utils.ts', 'README.md'])
 * ```
 */
export function buildFileTree(
  paths: string[],
  options: BuildFileTreeOptions = {}
): FileTreeEntry[] {
  const root = options.root ? splitPath(options.root).join('/') : ''
  const roots: FileTreeEntry[] = []

  const findChild = (list: FileTreeEntry[], label: string) =>
    list.find((entry) => entry.label === label)

  for (const raw of paths) {
    const segments = splitPath(raw)
    const trimmed =
      root && segments.join('/').startsWith(root)
        ? segments.slice(root.split('/').length)
        : segments
    if (trimmed.length === 0) continue

    let id = ''
    let level = roots

    for (let index = 0; index < trimmed.length; index++) {
      const label = trimmed[index]
      id = id ? `${id}/${label}` : label
      const directory = index < trimmed.length - 1

      // Re-walking an existing node is what collapses duplicates, and it is
      // also how `['src', 'src/a.ts']` grows children onto the first entry.
      let entry = findChild(level, label)

      if (!entry) {
        const extension = fileExtension(label)
        entry = { id, label, extension, kind: fileKind(extension, directory) }
        level.push(entry)
      }

      if (directory) {
        entry.children ??= []
        entry.kind = 'folder'
        entry.extension = ''
        level = entry.children
      }
    }
  }

  const sort = (entries: FileTreeEntry[]): FileTreeEntry[] => {
    entries.sort((a, b) => {
      const aFolder = a.children ? 0 : 1
      const bFolder = b.children ? 0 : 1
      if (aFolder !== bFolder) return aFolder - bFolder

      const left = a.label.toLowerCase()
      const right = b.label.toLowerCase()
      if (left !== right) return left < right ? -1 : 1
      return a.label < b.label ? -1 : a.label > b.label ? 1 : 0
    })
    for (const entry of entries) if (entry.children) sort(entry.children)
    return entries
  }

  return sort(roots)
}

/** Every directory path in a tree, for a "start fully expanded" default. */
export function collectDirectoryIds(entries: FileTreeEntry[]): string[] {
  const out: string[] = []

  const walk = (list: FileTreeEntry[]) => {
    for (const entry of list) {
      if (entry.children) {
        out.push(entry.id)
        walk(entry.children)
      }
    }
  }

  walk(entries)
  return out
}
