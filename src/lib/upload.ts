/**
 * `accept` matching for `FileUpload`, split out because it is the one piece of
 * that component with rules worth pinning down: the HTML rule is messier than
 * a string comparison, and the browser's own `input.accept` only applies to the
 * picker — a dropped folder full of files never passes through it.
 */

export interface AcceptGroups {
  /** Lowercased extensions with the dot kept, e.g. `['.pdf']`. */
  extensions: string[]
  /** Lowercased MIME patterns, wildcards kept, e.g. `['image/*', 'text/plain']`. */
  mimeTypes: string[]
}

export function parseAccept(accept?: string): AcceptGroups {
  const groups: AcceptGroups = { extensions: [], mimeTypes: [] }
  if (!accept) return groups

  for (const raw of accept.split(',')) {
    const entry = raw.trim().toLowerCase()
    if (!entry) continue

    if (entry.startsWith('.')) groups.extensions.push(entry)
    else groups.mimeTypes.push(entry)
  }

  return groups
}

/**
 * Whether a file satisfies an `accept` list. An empty list accepts everything.
 *
 * A file with no MIME type — which is what the browser reports for an unknown
 * extension — matches an extension entry but not a MIME entry. That asymmetry
 * is deliberate: it is the only way `.myext` can ever be accepted.
 */
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  const { extensions, mimeTypes } = parseAccept(accept)
  if (extensions.length === 0 && mimeTypes.length === 0) return true

  const name = file.name.toLowerCase()
  if (extensions.some((extension) => name.endsWith(extension))) return true

  const type = (file.type ?? '').toLowerCase()
  if (!type) return false

  return mimeTypes.some((pattern) => {
    if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1))
    return type === pattern
  })
}

/** Human-readable form of an accept list, for the drop zone's hint line. */
export function describeAccept(accept?: string): string {
  const { extensions, mimeTypes } = parseAccept(accept)
  const parts = [
    ...extensions,
    ...mimeTypes.map((pattern) => (pattern.endsWith('/*') ? `${pattern.slice(0, -2)} files` : pattern)),
  ]
  return parts.join(', ')
}
