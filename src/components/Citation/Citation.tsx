import * as React from 'react'
import { cn } from '@/lib/utils'
import { ExternalLinkIcon } from '@/lib/icons'

export interface CitationProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Footnote number, matching the `SourceChip` in the source list. */
  index: number
}

/**
 * Inline footnote marker for RAG answers. Renders an anchor in both cases so
 * the ref type is stable — without `href` it is simply not interactive.
 */
const Citation = React.forwardRef<HTMLAnchorElement, CitationProps>(
  ({ className, index, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        'mx-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm bg-muted px-1 align-super text-[0.7em] font-medium text-muted-foreground tabular-nums transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {index}
    </a>
  )
)
Citation.displayName = 'Citation'

export interface SourceChipProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  /** Link text — usually the page or document title. */
  title: string
  /** Footnote number matching the inline `Citation`. */
  index?: number
  /** Host label shown after the title, e.g. `react.dev`. */
  source?: string
}

/** Source pill for the list under an answer. */
const SourceChip = React.forwardRef<HTMLAnchorElement, SourceChipProps>(
  ({ className, title, index, source, href, ...props }, ref) => {
    const isExternal = Boolean(href && /^https?:\/\//.test(href))

    return (
      <a
        ref={ref}
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        className={cn(
          'inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {index !== undefined && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[0.65rem] font-medium text-muted-foreground tabular-nums">
            {index}
          </span>
        )}
        <span className="truncate font-medium">{title}</span>
        {source && (
          <span className="shrink-0 text-muted-foreground">{source}</span>
        )}
        {isExternal && (
          <ExternalLinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </a>
    )
  }
)
SourceChip.displayName = 'SourceChip'

export { Citation, SourceChip }
