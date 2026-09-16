import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircleIcon } from '@/lib/icons'

export interface StreamingTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text received so far. */
  text: string
  /** Stream is still open — renders a caret after the text. */
  streaming?: boolean
  /** The stream stopped early — renders an inline note after the text. */
  interrupted?: boolean
  /** Copy for the interrupted note. Defaults to "Interrupted". */
  interruptedLabel?: string
}

/**
 * Plain-text streaming output with a caret. For rich output, stream into
 * `MarkdownRenderer` instead — this is the light path.
 */
const StreamingText = React.forwardRef<HTMLSpanElement, StreamingTextProps>(
  (
    {
      className,
      text,
      streaming = false,
      interrupted = false,
      interruptedLabel = 'Interrupted',
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      aria-busy={streaming || undefined}
      className={cn('whitespace-pre-wrap break-words', className)}
      {...props}
    >
      {text}
      {streaming && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-[1px] animate-pulse bg-foreground align-baseline motion-reduce:animate-none"
        />
      )}
      {interrupted && (
        <span className="ml-1.5 inline-flex items-center gap-1 align-baseline text-xs text-muted-foreground">
          <AlertCircleIcon className="h-3 w-3" />
          {interruptedLabel}
        </span>
      )}
    </span>
  )
)
StreamingText.displayName = 'StreamingText'

export { StreamingText }
