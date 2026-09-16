import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../Button'
import { CheckIcon, CopyIcon } from '@/lib/icons'

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Raw code. Preferred for standalone use — the copy button reads it. */
  code?: string
  /** Language shown in the header, e.g. `ts`. Defaults to `text`. */
  language?: string
  /**
   * Pre-highlighted markup from a markdown pipeline. Used for rendering when
   * `code` is absent; copying falls back to the rendered text.
   */
  children?: React.ReactNode
}

/**
 * Code surface: language label, one-tap copy, horizontal scroll.
 * Highlighting is not its job — `MarkdownRenderer` feeds it highlighted nodes.
 */
const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, code, language, children, ...props }, ref) => {
    const codeRef = React.useRef<HTMLElement>(null)
    const timerRef = React.useRef(0)
    const [copied, setCopied] = React.useState(false)

    React.useEffect(() => () => window.clearTimeout(timerRef.current), [])

    const handleCopy = async () => {
      const text = code ?? codeRef.current?.textContent ?? ''
      if (!text || !navigator.clipboard?.writeText) return

      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // Clipboard denied (insecure context, permission block) — stay quiet.
        return
      }

      setCopied(true)
      timerRef.current = window.setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-muted/40',
          className
        )}
        {...props}
      >
        <div className="flex h-9 items-center justify-between gap-2 border-b border-border px-3">
          <span className="font-mono text-xs text-muted-foreground">
            {language ?? 'text'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{copied ? 'Copied' : 'Copy code'}</span>
          </Button>
        </div>
        <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
          <code ref={codeRef} className="hljs font-mono">
            {code ?? children}
          </code>
        </pre>
      </div>
    )
  }
)
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
