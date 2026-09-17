import * as React from 'react'
import { cn } from '@/lib/utils'
import { pickActiveAnchor, scrollTargetFor, type AnchorSection } from '@/lib/anchor'

export interface AnchorItem {
  /** The `id` of the target element — no leading `#`. */
  id: string
  title: React.ReactNode
  /** Nests under the previous item, the way a heading level nests. */
  level?: number
  disabled?: boolean
  children?: AnchorItem[]
}

export interface AnchorProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  items: AnchorItem[]
  /** Height of a sticky header above the page, so targets land below it. */
  offsetTop?: number
  /**
   * How far the target may sit from the reading line before the list stops
   * following the scroll. Keeps an unrelated jump — an accordion opening far
   * down the page — from yanking the highlight.
   */
  bounds?: number
  /** The scrolling element. Defaults to the window. */
  target?: () => Window | HTMLElement | null
  /** Fires when the highlighted section changes. */
  onChange?: (id: string) => void
  /** Accessible name for the list of links. */
  label?: string
}

const flatten = (items: AnchorItem[]): AnchorItem[] =>
  items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])])

/**
 * A table of contents that highlights where you are.
 *
 * The links are real `<a href="#id">` elements — they work without JavaScript,
 * they are copyable, and the browser's own "skip to section" behaviour comes
 * for free. The click handler only takes over to control the scroll offset, so
 * a sticky header does not swallow the heading it jumps to.
 *
 * ```tsx
 * <Anchor items={[{ id: 'install', title: 'Install' }]} offsetTop={64} />
 * ```
 */
const Anchor = React.forwardRef<HTMLElement, AnchorProps>(
  (
    {
      className,
      items,
      offsetTop = 0,
      bounds = 5,
      target,
      onChange,
      label = 'On this page',
      ...props
    },
    ref
  ) => {
    const flat = React.useMemo(() => flatten(items), [items])
    const [active, setActive] = React.useState<string | undefined>(flat[0]?.id)
    const lastReported = React.useRef<string | undefined>(undefined)

    const container = React.useCallback(() => target?.() ?? window, [target])

    React.useEffect(() => {
      const scrollNode = container()
      const element =
        scrollNode === window ? window : (scrollNode as HTMLElement)

      const scrollTopOf = () =>
        scrollNode === window
          ? window.scrollY
          : (scrollNode as HTMLElement).scrollTop

      const measure = () => {
        const sections: AnchorSection[] = []
        const scrollTop = scrollTopOf()
        const containerTop =
          scrollNode === window
            ? 0
            : -((scrollNode as HTMLElement).getBoundingClientRect().top)

        for (const item of flat) {
          const node = document.getElementById(item.id)
          if (!node) continue
          const rect = node.getBoundingClientRect()
          sections.push({
            id: item.id,
            top:
              rect.top +
              (scrollNode === window ? scrollTop : scrollTop - containerTop),
          })
        }

        if (sections.length === 0) return

        const next = pickActiveAnchor(sections, scrollTop, offsetTop + bounds)
        setActive(next)
        if (next !== lastReported.current) {
          lastReported.current = next
          if (next) onChange?.(next)
        }
      }

      measure()
      element.addEventListener('scroll', measure, { passive: true })
      window.addEventListener('resize', measure)

      return () => {
        element.removeEventListener('scroll', measure)
        window.removeEventListener('resize', measure)
      }
    }, [flat, offsetTop, bounds, onChange, container])

    const handleClick = (
      event: React.MouseEvent<HTMLAnchorElement>,
      id: string
    ) => {
      // Leave modified clicks alone: open-in-new-tab should stay open-in-new-tab.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const node = document.getElementById(id)
      if (!node) return

      event.preventDefault()
      const scrollNode = container()

      if (scrollNode === window) {
        const max = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        )
        const top = scrollTargetFor(
          node.getBoundingClientRect().top + window.scrollY,
          offsetTop,
          max
        )
        window.scrollTo({ top, behavior: 'smooth' })
      } else {
        const box = scrollNode as HTMLElement
        const max = Math.max(0, box.scrollHeight - box.clientHeight)
        const top = scrollTargetFor(
          node.getBoundingClientRect().top -
            box.getBoundingClientRect().top +
            box.scrollTop,
          offsetTop,
          max
        )
        box.scrollTo({ top, behavior: 'smooth' })
      }

      setActive(id)
      lastReported.current = id
      onChange?.(id)
      // Move focus with the reading position, so the next Tab continues from
      // the section the reader just jumped into.
      node.focus({ preventScroll: true })
    }

    const renderItem = (item: AnchorItem, depth: number) => {
      const on = active === item.id
      return (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={on ? 'location' : undefined}
            data-active={on || undefined}
            aria-disabled={item.disabled || undefined}
            onClick={(event) => {
              if (item.disabled) {
                event.preventDefault()
                return
              }
              handleClick(event, item.id)
            }}
            className={cn(
              'block truncate border-l-2 py-1 text-sm transition-colors',
              item.disabled
                ? 'cursor-not-allowed border-transparent text-muted-foreground/60'
                : on
                  ? 'border-primary font-medium text-foreground'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground',
              depth === 0 ? 'pl-3' : 'pl-6'
            )}
          >
            {item.title}
          </a>
          {item.children && (
            <ul>{item.children.map((child) => renderItem(child, depth + 1))}</ul>
          )}
        </li>
      )
    }

    return (
      <nav
        ref={ref}
        aria-label={label}
        data-slot="anchor"
        className={cn('text-sm', className)}
        {...props}
      >
        <ul className="space-y-0.5">{items.map((item) => renderItem(item, 0))}</ul>
      </nav>
    )
  }
)
Anchor.displayName = 'Anchor'

export { Anchor }
