import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  diffLines,
  diffStats,
  formatUnifiedDiff,
  toHunks,
  toSplitRows,
  type DiffLine,
} from '@/lib/diff'
import { useControllableState } from '@/lib/use-controllable-state'
import { CheckIcon, ChevronRightIcon, ColumnsIcon, CopyIcon, RowsIcon } from '@/lib/icons'

export type DiffView = 'unified' | 'split'

export interface DiffLabels {
  /** Fold summary. `count` is the number of lines it hides. */
  unchangedLines?: (count: number) => string
  /** Shown when the two sides are identical. */
  identical?: string
  /** Accessible name of the two view switches. */
  unified?: string
  split?: string
  /** Accessible name of the copy control, and the state it flips to. */
  copy?: string
  copied?: string
}

export interface DiffProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The original text. */
  before: string
  /** The changed text. */
  after: string
  /** Own the view, or leave it to the component with `defaultView`. */
  view?: DiffView
  defaultView?: DiffView
  onViewChange?: (view: DiffView) => void
  /** Unchanged lines kept around each change. `0` shows changes only. */
  context?: number
  /** Hide the old/new gutters. */
  showLineNumbers?: boolean
  /** Let a collapsed run be opened. Without it the fold is a static row. */
  expandable?: boolean
  /** Filename, view switch and copy action above the diff. */
  showHeader?: boolean
  /** Shown in the header. Also names the copied patch's `---`/`+++` lines. */
  filename?: string
  /** A label for the header, e.g. "typescript". Not a highlighter. */
  language?: string
  /** Wrap long lines instead of scrolling / clipping them. */
  wrap?: boolean
  labels?: DiffLabels
}

const DEFAULT_LABELS: Required<DiffLabels> = {
  unchangedLines: (count: number) => `${count} unchanged line${count === 1 ? '' : 's'}`,
  identical: 'No changes',
  unified: 'Unified view',
  split: 'Split view',
  copy: 'Copy diff',
  copied: 'Copied',
}

const rowTint = (type: DiffLine['type']) =>
  type === 'add' ? 'bg-success/10' : type === 'remove' ? 'bg-destructive/10' : undefined

const signFor = (type: DiffLine['type']) => (type === 'add' ? '+' : type === 'remove' ? '-' : '')

const signTint = (type: DiffLine['type']) =>
  type === 'add' ? 'text-success' : type === 'remove' ? 'text-destructive' : 'text-transparent'

const numberClass = 'select-none text-right tabular-nums text-muted-foreground/70'

const textClass = (wrap: boolean) =>
  cn('min-w-0 font-mono text-xs leading-5', wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')

/** One side of one row: gutter, sign, text. */
function DiffCell({
  line,
  side,
  wrap,
  showLineNumbers,
}: {
  line?: DiffLine
  side: 'old' | 'new'
  wrap: boolean
  showLineNumbers: boolean
}) {
  const number = side === 'old' ? line?.oldLine : line?.newLine

  return (
    <div
      className={cn(
        'grid items-start gap-x-2 px-2',
        showLineNumbers
          ? 'grid-cols-[2.25rem_0.75rem_minmax(0,1fr)]'
          : 'grid-cols-[0.75rem_minmax(0,1fr)]',
        line ? rowTint(line.type) : 'bg-muted/20'
      )}
    >
      {showLineNumbers && (
        <span className={numberClass}>{line ? number : ''}</span>
      )}
      <span aria-hidden="true" className={cn('select-none', line ? signTint(line.type) : '')}>
        {line ? signFor(line.type) : ''}
      </span>
      <span className={textClass(wrap)}>{line ? line.text || ' ' : ''}</span>
    </div>
  )
}

function UnifiedRow({
  line,
  wrap,
  showLineNumbers,
}: {
  line: DiffLine
  wrap: boolean
  showLineNumbers: boolean
}) {
  return (
    <div
      data-diff-line={line.type}
      className={cn(
        'grid items-start gap-x-2 px-2',
        showLineNumbers
          ? 'grid-cols-[2.25rem_2.25rem_0.75rem_minmax(0,1fr)]'
          : 'grid-cols-[0.75rem_minmax(0,1fr)]',
        rowTint(line.type)
      )}
    >
      {showLineNumbers && (
        <>
          <span className={numberClass}>{line.oldLine ?? ''}</span>
          <span className={numberClass}>{line.newLine ?? ''}</span>
        </>
      )}
      <span aria-hidden="true" className={cn('select-none', signTint(line.type))}>
        {signFor(line.type)}
      </span>
      <span className={textClass(wrap)}>{line.text || ' '}</span>
    </div>
  )
}

function FoldRow({
  count,
  open,
  labels,
  onToggle,
}: {
  count: number
  open: boolean
  labels: Required<DiffLabels>
  onToggle?: () => void
}) {
  const body = (
    <>
      <ChevronRightIcon
        className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-90')}
      />
      {labels.unchangedLines(count)}
    </>
  )
  const className =
    'flex w-full items-center gap-1.5 bg-muted/40 px-2 py-0.5 text-left text-xs text-muted-foreground'

  if (!onToggle) {
    return (
      <div data-diff-fold={count} className={cn(className, 'select-none')}>
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-diff-fold={count}
      aria-expanded={open}
      onClick={onToggle}
      className={cn(className, 'hover:bg-muted hover:text-foreground')}
    >
      {body}
    </button>
  )
}

/**
 * A line diff of two texts, unified or side by side, with unchanged runs
 * folded away.
 *
 * The diff itself is computed here rather than pulled in: `lib/diff` trims the
 * common head and tail first and only aligns the changed middle, which keeps a
 * review panel fast without a dependency. Lines are **not** syntax
 * highlighted — colouring a diff needs both sides highlighted consistently, and
 * that is a different job from showing what changed.
 *
 * `unified` scrolls horizontally when a line is wider than the panel. `split`
 * gives each side half the width and clips what does not fit, as side-by-side
 * reading is about comparing two versions of the same line: pass `wrap` when
 * the lines are long.
 *
 * ```tsx
 * <Diff before={oldSource} after={newSource} filename="app.tsx" />
 * ```
 */
const Diff = React.forwardRef<HTMLDivElement, DiffProps>(
  (
    {
      className,
      before,
      after,
      view,
      defaultView = 'unified',
      onViewChange,
      context = 3,
      showLineNumbers = true,
      expandable = true,
      showHeader = false,
      filename,
      language,
      wrap = false,
      labels,
      ...props
    },
    ref
  ) => {
    const text = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])
    const lines = React.useMemo(() => diffLines(before, after), [before, after])
    const hunks = React.useMemo(() => toHunks(lines, context), [lines, context])
    const stats = React.useMemo(() => diffStats(lines), [lines])
    const splitRows = React.useMemo(() => toSplitRows(lines), [lines])

    const [currentView, setView] = useControllableState<DiffView>({
      value: view,
      defaultValue: defaultView,
      onValueChange: onViewChange,
    })

    const [openFolds, setOpenFolds] = React.useState<number[]>([])
    const toggleFold = (key: number) =>
      setOpenFolds((open) =>
        open.includes(key) ? open.filter((entry) => entry !== key) : [...open, key]
      )

    const [copied, setCopied] = React.useState(false)
    const timer = React.useRef<number | undefined>(undefined)
    React.useEffect(() => () => window.clearTimeout(timer.current), [])

    const handleCopy = async () => {
      const patch = formatUnifiedDiff(hunks, {
        oldName: `a/${filename ?? 'before'}`,
        newName: `b/${filename ?? 'after'}`,
      })
      if (!patch || !navigator.clipboard?.writeText) return

      try {
        await navigator.clipboard.writeText(patch)
      } catch {
        return
      }

      setCopied(true)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    }

    /**
     * Hunk rows and fold rows interleaved. The fold key is the index of the
     * first hidden line, which stays stable while other folds open and close.
     */
    const renderUnified = () => {
      const out: React.ReactNode[] = []
      let cursor = 0

      for (const hunk of hunks) {
        if (hunk.hidden.length > 0) {
          const key = cursor
          const open = openFolds.includes(key)
          out.push(
            <FoldRow
              key={`fold-${key}`}
              count={hunk.hidden.length}
              open={open}
              labels={text}
              onToggle={expandable ? () => toggleFold(key) : undefined}
            />
          )
          if (open) {
            for (const line of hunk.hidden) {
              out.push(
                <UnifiedRow
                  key={`line-${line.oldLine}-ctx`}
                  line={line}
                  wrap={wrap}
                  showLineNumbers={showLineNumbers}
                />
              )
            }
          }
        }

        for (const line of hunk.lines) {
          out.push(
            <UnifiedRow
              key={`line-${line.oldLine ?? 'a'}-${line.newLine ?? 'b'}`}
              line={line}
              wrap={wrap}
              showLineNumbers={showLineNumbers}
            />
          )
        }

        cursor = hunk.endIndex + 1
      }

      const trailing = lines.slice(cursor)
      if (trailing.length > 0) {
        const key = cursor
        const open = openFolds.includes(key)
        out.push(
          <FoldRow
            key={`fold-${key}`}
            count={trailing.length}
            open={open}
            labels={text}
            onToggle={expandable ? () => toggleFold(key) : undefined}
          />
        )
        if (open) {
          for (const line of trailing) {
            out.push(
              <UnifiedRow
                key={`line-${line.oldLine}-tail`}
                line={line}
                wrap={wrap}
                showLineNumbers={showLineNumbers}
              />
            )
          }
        }
      }

      return out
    }

    const renderSplit = () =>
      splitRows.map((row, index) => (
        <div
          key={`split-${index}`}
          data-diff-line={row.left?.type ?? row.right?.type ?? 'context'}
          className="grid grid-cols-2 divide-x divide-border"
        >
          <div className="min-w-0 overflow-hidden">
            <DiffCell line={row.left} side="old" wrap={wrap} showLineNumbers={showLineNumbers} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <DiffCell line={row.right} side="new" wrap={wrap} showLineNumbers={showLineNumbers} />
          </div>
        </div>
      ))

    const viewButton = (option: DiffView, icon: React.ReactNode) => (
      <button
        key={option}
        type="button"
        aria-pressed={currentView === option}
        aria-label={text[option]}
        onClick={() => setView(option)}
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground',
          currentView === option
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:text-foreground'
        )}
      >
        {icon}
      </button>
    )

    const identical = hunks.length === 0

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
        {...props}
      >
        {showHeader && (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              {filename && (
                <span className="truncate font-mono text-xs text-foreground">{filename}</span>
              )}
              {language && (
                <span className="shrink-0 text-xs text-muted-foreground">{language}</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-xs tabular-nums">
                <span className="text-success">+{stats.added}</span>{' '}
                <span className="text-destructive">-{stats.removed}</span>
              </span>

              <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5">
                {viewButton('unified', <RowsIcon className="h-3.5 w-3.5" />)}
                {viewButton('split', <ColumnsIcon className="h-3.5 w-3.5" />)}
              </div>

              {!identical && (
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? text.copied : text.copy}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {identical ? (
          <p data-diff-identical className="px-3 py-4 text-xs text-muted-foreground">
            {text.identical}
          </p>
        ) : currentView === 'unified' ? (
          <div data-view="unified" className="overflow-x-auto py-1">
            <div className="w-max min-w-full">{renderUnified()}</div>
          </div>
        ) : (
          <div data-view="split" className="py-1">
            {renderSplit()}
          </div>
        )}
      </div>
    )
  }
)
Diff.displayName = 'Diff'

export type CodeDiffProps = DiffProps

/**
 * `Diff` with the header on — the filename, the change counts, the view switch
 * and a button that copies a real patch file. This is the one to reach for in a
 * review or agent output panel; the plain `Diff` is for when the surrounding UI
 * already says what is being compared.
 */
const CodeDiff = React.forwardRef<HTMLDivElement, CodeDiffProps>((props, ref) => (
  <Diff ref={ref} showHeader expandable {...props} />
))
CodeDiff.displayName = 'CodeDiff'

export { Diff, CodeDiff }
