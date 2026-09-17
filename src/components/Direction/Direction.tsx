import * as React from 'react'
import { useControllableState } from '@/lib/use-controllable-state'

export type Direction = 'ltr' | 'rtl'

export interface DirectionControls {
  dir: Direction
  setDir: (dir: Direction) => void
}

const DirectionContext = React.createContext<DirectionControls | null>(null)

/** The `dir` attribute nearest to `element`, or the document's, or `ltr`. */
export function resolveDirection(element?: Element | null, fallback: Direction = 'ltr'): Direction {
  if (typeof document === 'undefined') return fallback

  const scope = element?.closest('[dir]')
  const value = scope?.getAttribute('dir') ?? document.documentElement.getAttribute('dir')

  return value === 'rtl' ? 'rtl' : value === 'ltr' ? 'ltr' : fallback
}

export interface DirectionProviderProps {
  /** Controlled direction. Omit to let the provider own it. */
  dir?: Direction
  defaultDir?: Direction
  onDirChange?: (dir: Direction) => void
  /**
   * Mirror the value onto `<html dir>`, so portalled content — dialogs,
   * popovers, tooltips — follows a direction that was set on a subtree.
   * Off by default: a component library should not mutate the document unless
   * asked.
   */
  applyToDocument?: boolean
  children: React.ReactNode
}

/**
 * Direction context for RTL layouts.
 *
 * Radix primitives already accept a `dir` prop; this provider is the shared
 * answer to "what is the direction here", so a single `dir` on the app shell
 * does not have to be threaded through every call site, and `useDirection()`
 * reads it from anywhere below.
 *
 * Two honest limits, because a direction switch is not just a class name:
 *
 * 1. The library styles box edges with physical utilities (`pl-3`, `right-2`).
 *    A component with mirrored padding needs the logical form (`ps-3`, `end-2`)
 *    or `rtl:` variants — check the component you are putting in an RTL tree.
 * 2. Direction is **not** inherited through a portal. If you mount the provider
 *    below `<html>`, pass `applyToDocument` so menus and dialogs opened from
 *    inside the tree are laid out correctly.
 *
 * ```tsx
 * <DirectionProvider dir={rtl ? 'rtl' : 'ltr'} applyToDocument>
 *   <App />
 * </DirectionProvider>
 * ```
 */
export function DirectionProvider({
  dir,
  defaultDir,
  onDirChange,
  applyToDocument = false,
  children,
}: DirectionProviderProps) {
  const [value, setValue] = useControllableState<Direction>({
    value: dir,
    defaultValue: defaultDir ?? 'ltr',
    onValueChange: onDirChange,
  })

  React.useEffect(() => {
    if (!applyToDocument || typeof document === 'undefined') return

    const root = document.documentElement
    const previous = root.getAttribute('dir')
    root.setAttribute('dir', value)

    return () => {
      if (previous === null) root.removeAttribute('dir')
      else root.setAttribute('dir', previous)
    }
  }, [applyToDocument, value])

  const controls = React.useMemo<DirectionControls>(
    () => ({ dir: value, setDir: setValue }),
    [value, setValue]
  )

  return <DirectionContext.Provider value={controls}>{children}</DirectionContext.Provider>
}

/**
 * The direction in scope. Falls back to reading `dir` off the DOM when there is
 * no provider above, which is the common case for an app that sets it on
 * `<html>` and never mounts a provider at all.
 */
export function useDirection(): Direction {
  const fromContext = React.useContext(DirectionContext)
  return fromContext?.dir ?? resolveDirection()
}

/**
 * The direction plus a way to change it, for a language switcher inside the
 * tree. Without a provider this returns the DOM's direction and a no-op setter
 * — flip the attribute on `<html>` yourself in that case.
 */
export function useDirectionControls(): DirectionControls {
  const fromContext = React.useContext(DirectionContext)
  return fromContext ?? { dir: resolveDirection(), setDir: () => {} }
}

export { DirectionContext }
