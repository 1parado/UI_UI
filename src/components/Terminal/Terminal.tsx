import * as React from 'react'
import { cn } from '@/lib/utils'
import { paletteColor, parseAnsi, stripAnsi, type AnsiToken } from '@/lib/ansi'
import { CheckIcon, CopyIcon, TrashIcon, ArrowDownIcon } from '@/lib/icons'

export interface LogLine {
  /** Stable key. Index is used when absent. */
  id?: string
  text: string
  /** Rendered before the text — a level chip, an icon, a marker. */
  gutter?: React.ReactNode
  /** Shown in the timestamp column when `timestamps` is on. */
  timestamp?: Date | string | number
}

export interface TerminalLabels {
  /** Notice for the lines a ring buffer has dropped. */
  hiddenLines?: (count: number) => string
  jumpToLatest?: string
  copy?: string
  copied?: string
  clear?: string
  empty?: string
  /** Accessible name of the scroll region. */
  region?: string
}

export interface TerminalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Output, oldest first. A bare string is a plain line. */
  lines: Array<string | LogLine>
  /** Keep only the last N lines. `0` keeps everything. Defaults to `2000`. */
  maxLines?: number
  /** Follow new output. Scrolling up pauses it; the button resumes it. */
  autoScroll?: boolean
  /** Read ANSI SGR escapes and colour them. Defaults to `true`. */
  ansi?: boolean
  /** Show the timestamp column. Lines without one leave it blank. */
  timestamps?: boolean
  /**
   * Wrap long lines. Defaults to `true`: a log is read top to bottom, and
   * horizontal scrolling hides the very thing you came for. Set it to `false`
   * for tabular output.
   */
  wrap?: boolean
  /** The bar above the output: title, copy, clear. Defaults to `true`. */
  showHeader?: boolean
  /** Header text. */
  title?: React.ReactNode
  /** Offer the copy control. Defaults to `true`. */
  copyable?: boolean
  /** Still running: draws a caret under the last line. */
  pending?: boolean
  /**
   * A second bar under the header, inside the terminal chrome. `LogViewer`
   * puts its filter row here; the border and padding belong to the terminal so
   * that a toolbar cannot drift out of the frame.
   */
  toolbar?: React.ReactNode
  /** Text written into the region when there is nothing to show. */
  emptyMessage?: string
  /** Clearing is local to the view; the caller's array is not touched. */
  onClear?: () => void
  labels?: TerminalLabels
}

const DEFAULT_LABELS: Required<TerminalLabels> = {
  hiddenLines: (count: number) => `${count} earlier line${count === 1 ? '' : 's'} hidden`,
  jumpToLatest: 'Jump to latest',
  copy: 'Copy output',
  copied: 'Copied',
  clear: 'Clear output',
  empty: 'No output yet',
  region: 'Terminal output',
}

const formatTime = (value: Date | string | number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value))

const colorValue = (color: { kind: 'palette'; index: number } | { kind: 'rgb'; hex: string }) =>
  color.kind === 'palette' ? paletteColor(color.index) : color.hex

/**
 * A span of terminal text with its SGR attributes applied.
 *
 * Named colours resolve through `hsl(var(--ansi-*))`, and reverse video swaps
 * the foreground and background rather than inventing a colour — which is what
 * a terminal does, and what keeps a selected line readable.
 */
function TokenSpan({ token }: { token: AnsiToken }) {
  const styled =
    token.fg || token.bg || token.bold || token.dim || token.italic || token.underline || token.inverse

  // Untouched text stays a bare string: no span, no style attribute. Most of a
  // log is untouched, and an empty wrapper per line is a lot of DOM for nothing.
  if (!styled) return token.text

  const color = token.fg ? colorValue(token.fg) : undefined
  const background = token.bg ? colorValue(token.bg) : undefined

  const style: React.CSSProperties = token.inverse
    ? {
        color: background ?? 'hsl(var(--terminal-bg))',
        backgroundColor: color ?? 'hsl(var(--terminal-foreground))',
      }
    : { color, backgroundColor: background }

  return (
    <span
      style={style}
      className={cn(
        token.bold && 'font-semibold',
        token.dim && 'opacity-70',
        token.italic && 'italic',
        token.underline && 'underline'
      )}
    >
      {token.text}
    </span>
  )
}

/**
 * Terminal output: colours, a ring buffer, and output that follows itself until
 * you scroll up to read something.
 *
 * The surface stays dark in both themes — a terminal that follows a light theme
 * stops reading as a terminal, and the ANSI palette is tuned for one background
 * rather than two. That is why the colours come from `--terminal-*` and
 * `--ansi-*` rather than from the usual surface tokens, and why every divider
 * inside the box is an alpha of `terminal-foreground` instead of `border`.
 *
 * ```tsx
 * <Terminal
 *   title="vite"
 *   lines={output}
 *   pending={running}
 *   maxLines={5000}
 * />
 * ```
 */
const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      className,
      lines,
      maxLines = 2000,
      autoScroll = true,
      ansi = true,
      timestamps = false,
      wrap = true,
      showHeader = true,
      title,
      copyable = true,
      pending = false,
      toolbar,
      emptyMessage,
      onClear,
      labels,
      ...props
    },
    ref
  ) => {
    const text = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])
    const normalized = React.useMemo<LogLine[]>(
      () => lines.map((line) => (typeof line === 'string' ? { text: line } : line)),
      [lines]
    )

    // Clearing hides what is on screen without touching the caller's array. The
    // mark is clamped so that output arriving afterwards is always visible.
    const [cleared, setCleared] = React.useState(0)
    const kept = normalized.slice(Math.min(cleared, normalized.length))
    const visible = maxLines > 0 ? kept.slice(-maxLines) : kept
    const dropped = kept.length - visible.length

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const endRef = React.useRef<HTMLDivElement>(null)
    const [following, setFollowing] = React.useState(true)

    const signature = `${visible.length}:${visible[visible.length - 1]?.text ?? ''}`

    React.useEffect(() => {
      if (!autoScroll || !following) return
      endRef.current?.scrollIntoView({ block: 'end' })
    }, [signature, autoScroll, following])

    const handleScroll = () => {
      const element = scrollRef.current
      if (!element) return
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight
      setFollowing(distance < 24)
    }

    const [copied, setCopied] = React.useState(false)
    const timer = React.useRef<number | undefined>(undefined)
    React.useEffect(() => () => window.clearTimeout(timer.current), [])

    const visibleText = () =>
      visible.map((line) => (ansi ? stripAnsi(line.text) : line.text)).join('\n')

    const handleCopy = async () => {
      const output = visibleText()
      if (!output || !navigator.clipboard?.writeText) return

      try {
        await navigator.clipboard.writeText(output)
      } catch {
        return
      }

      setCopied(true)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    }

    const handleClear = () => {
      setCleared(normalized.length)
      onClear?.()
    }

    const controlClass =
      'inline-flex h-6 w-6 items-center justify-center rounded-sm text-terminal-foreground/60 hover:bg-terminal-foreground/10 hover:text-terminal-foreground'

    const showJump = autoScroll && !following && visible.length > 0

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-64 flex-col overflow-hidden rounded-lg border border-border bg-terminal font-mono text-xs text-terminal-foreground',
          className
        )}
        {...props}
      >
        {showHeader && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-terminal-foreground/15 px-3 py-1.5">
            <span className="min-w-0 truncate text-terminal-foreground/70">{title}</span>

            <span className="flex shrink-0 items-center gap-1">
              {copyable && (
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? text.copied : text.copy}
                  className={controlClass}
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                aria-label={text.clear}
                className={controlClass}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        )}

        {toolbar && (
          <div className="shrink-0 border-b border-terminal-foreground/15 px-3 py-1.5">
            {toolbar}
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-label={text.region}
          className="min-h-0 flex-1 overflow-auto px-3 py-2"
        >
          {visible.length === 0 ? (
            <p className="text-terminal-foreground/50">{emptyMessage ?? text.empty}</p>
          ) : (
            <>
              {dropped > 0 && (
                <p data-terminal-dropped={dropped} className="text-terminal-foreground/40">
                  {text.hiddenLines(dropped)}
                </p>
              )}

              {visible.map((line, index) => (
                <div
                  key={line.id ?? index}
                  className={cn('flex gap-2', wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')}
                >
                  {timestamps && (
                    <span className="shrink-0 select-none tabular-nums text-terminal-foreground/40">
                      {line.timestamp === undefined ? '' : formatTime(line.timestamp)}
                    </span>
                  )}
                  {line.gutter !== undefined && <span className="shrink-0">{line.gutter}</span>}
                  <span className="min-w-0">
                    {ansi
                      ? parseAnsi(line.text).map((token, tokenIndex) => (
                          <TokenSpan key={tokenIndex} token={token} />
                        ))
                      : line.text}
                  </span>
                </div>
              ))}

              {pending && (
                <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
                  ▍
                </div>
              )}
            </>
          )}

          <div ref={endRef} aria-hidden="true" />
        </div>

        {showJump && (
          <button
            type="button"
            onClick={() => setFollowing(true)}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-terminal-foreground/15 px-3 py-1 text-xs backdrop-blur hover:bg-terminal-foreground/25"
          >
            <ArrowDownIcon className="h-3.5 w-3.5" />
            {text.jumpToLatest}
          </button>
        )}
      </div>
    )
  }
)
Terminal.displayName = 'Terminal'

export { Terminal }
