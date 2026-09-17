import * as React from 'react'
import { cn } from '@/lib/utils'
import { paletteColor, stripAnsi } from '@/lib/ansi'
import { LOG_LEVELS, countLevels, parseLogLevel, type LogLevel } from '@/lib/log'
import { useControllableState } from '@/lib/use-controllable-state'
import { Terminal, type TerminalProps } from '@/components/Terminal/Terminal'
import { SearchIcon, XIcon } from '@/lib/icons'

export interface LogEntry {
  id?: string
  text: string
  /** Set it when the line does not say its own level. */
  level?: LogLevel
}

export interface LogViewerLabels {
  /** Placeholder and accessible name of the search box. */
  search?: string
  /** Accessible name of the clear-search control. */
  clearSearch?: string
  /** Filter button labels, per level. */
  levels?: Partial<Record<LogLevel, string>>
  /** Shown when the filters match nothing. */
  noMatches?: string
  /** Header summary, e.g. "12 lines" / "3 of 12". */
  summary?: (shown: number, total: number) => string
  /** Accessible name of the scroll region. */
  region?: string
}

export interface LogViewerProps
  extends Omit<TerminalProps, 'lines' | 'title' | 'toolbar' | 'labels'> {
  lines: Array<string | LogEntry>
  /** Heading in the header bar. */
  title?: React.ReactNode
  /** Which levels to show. Omit to show every line. */
  levels?: LogLevel[]
  onLevelsChange?: (levels: LogLevel[]) => void
  /** Offer the level filter. Defaults to `true`. */
  filterable?: boolean
  /** Offer the search box. Defaults to `true`. */
  searchable?: boolean
  /** Own the query, or let the component hold it. */
  search?: string
  defaultSearch?: string
  onSearchChange?: (query: string) => void
  labels?: LogViewerLabels
}

const DEFAULT_LABELS: Required<LogViewerLabels> = {
  search: 'Filter output',
  clearSearch: 'Clear filter',
  levels: {
    trace: 'Trace',
    debug: 'Debug',
    info: 'Info',
    warn: 'Warn',
    error: 'Error',
    fatal: 'Fatal',
  },
  noMatches: 'No lines match',
  summary: (shown: number, total: number) =>
    shown === total ? `${total} lines` : `${shown} of ${total}`,
  region: 'Log output',
}

/** ANSI indices, picked so the ramp reads on the dark terminal surface. */
const LEVEL_COLOR: Record<LogLevel, number> = {
  trace: 8,
  debug: 4,
  info: 6,
  warn: 3,
  error: 1,
  fatal: 9,
}

const levelChip = (level: LogLevel) => (
  <span
    className="inline-block w-10 text-[10px] font-semibold uppercase tracking-wide"
    style={{ color: paletteColor(LEVEL_COLOR[level]) }}
  >
    {level}
  </span>
)

/**
 * Terminal output with the level read off each line: a coloured chip, a filter
 * row and a search box.
 *
 * The level is not something you have to set — `lib/log` reads it off the text
 * the way loggers write it, so an existing process's output can be piped in
 * untouched. Pass `level` on an entry when the line does not say it.
 *
 * The filter chips solo a level: one click shows only the errors, another shows
 * everything again. Pass `levels` to drive the visible set yourself.
 *
 * ```tsx
 * <LogViewer title="worker" lines={output} />
 * ```
 */
const LogViewer = React.forwardRef<HTMLDivElement, LogViewerProps>(
  (
    {
      className,
      lines,
      title,
      levels,
      onLevelsChange,
      filterable = true,
      searchable = true,
      search,
      defaultSearch,
      onSearchChange,
      labels,
      ...props
    },
    ref
  ) => {
    const text = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])

    const [query, setQuery] = useControllableState<string>({
      value: search,
      defaultValue: defaultSearch ?? '',
      onValueChange: onSearchChange,
    })
    const [activeLevels, setActiveLevels] = useControllableState<LogLevel[]>({
      value: levels,
      defaultValue: LOG_LEVELS,
      onValueChange: onLevelsChange,
    })

    const entries = React.useMemo<LogEntry[]>(
      () => lines.map((line) => (typeof line === 'string' ? { text: line } : line)),
      [lines]
    )

    const counts = React.useMemo(
      () => countLevels(entries.map((entry) => entry.text)),
      [entries]
    )

    const shown = React.useMemo(() => {
      const needle = query.trim().toLowerCase()

      return entries.filter((entry) => {
        const level = entry.level ?? parseLogLevel(entry.text)
        if (level && !activeLevels.includes(level)) return false
        if (!needle) return true
        return stripAnsi(entry.text).toLowerCase().includes(needle)
      })
    }, [entries, activeLevels, query])

    const isAll = activeLevels.length >= LOG_LEVELS.length
    const isSolo = activeLevels.length === 1

    /**
     * A chip solos its level, and clicking the soloed chip again shows
     * everything. "Only the errors" is one click — by far the most common thing
     * to want from a log — while the caller keeps the full set through the
     * controlled `levels` prop, which the chips cannot express.
     */
    const pickLevel = (level: LogLevel) => {
      if (isSolo && activeLevels[0] === level) setActiveLevels(LOG_LEVELS)
      else setActiveLevels([level])
    }

    const rendered = shown.map((entry) => {
      const level = entry.level ?? parseLogLevel(entry.text)
      return { id: entry.id, text: entry.text, gutter: level ? levelChip(level) : undefined }
    })

    const toolbar = (
      <div className="flex flex-wrap items-center gap-1.5">
        {filterable &&
          LOG_LEVELS.map((level) => {
            const on = !isAll && activeLevels.includes(level)
            return (
              <button
                key={level}
                type="button"
                aria-pressed={on}
                onClick={() => pickLevel(level)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px]',
                  on
                    ? 'bg-terminal-foreground/15'
                    : 'text-terminal-foreground/40 hover:text-terminal-foreground/70'
                )}
                style={on ? { color: paletteColor(LEVEL_COLOR[level]) } : undefined}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: paletteColor(LEVEL_COLOR[level]) }}
                />
                {text.levels[level]}
                <span className="tabular-nums opacity-70">{counts[level]}</span>
              </button>
            )
          })}

        <span className="ml-auto text-[11px] text-terminal-foreground/40">
          {text.summary(shown.length, entries.length)}
        </span>

        {searchable && (
          <span className="flex items-center gap-1 rounded-sm border border-terminal-foreground/15 px-1.5">
            <SearchIcon className="h-3 w-3 shrink-0 text-terminal-foreground/40" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.search}
              aria-label={text.search}
              className="h-6 w-28 bg-transparent text-[11px] text-terminal-foreground placeholder:text-terminal-foreground/40 focus:outline-none"
            />
            {query !== '' && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={text.clearSearch}
                className="shrink-0 text-terminal-foreground/40 hover:text-terminal-foreground"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </span>
        )}
      </div>
    )

    const showToolbar = filterable || searchable

    return (
      <Terminal
        ref={ref}
        className={className}
        {...props}
        title={title}
        lines={rendered}
        toolbar={showToolbar ? toolbar : undefined}
        emptyMessage={entries.length > 0 ? text.noMatches : undefined}
        labels={{ region: text.region }}
      />
    )
  }
)
LogViewer.displayName = 'LogViewer'

export { LogViewer }
