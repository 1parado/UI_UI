import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../Button'
import { Separator } from '../Separator'
import { RefreshIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/lib/icons'

export type FeedbackValue = 'up' | 'down'

export interface FeedbackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  /** Controlled rating. */
  value?: FeedbackValue | null
  onValueChange?: (value: FeedbackValue | null) => void
  /** Uncontrolled initial rating. */
  defaultValue?: FeedbackValue | null
  /** Renders the regenerate action when provided. */
  onRegenerate?: () => void
}

/** Rate a response, and optionally regenerate it. Clicking the active thumb clears it. */
const Feedback = React.forwardRef<HTMLDivElement, FeedbackProps>(
  (
    {
      className,
      value,
      onValueChange,
      defaultValue = null,
      onRegenerate,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const current = value !== undefined ? value : internalValue

    const select = (next: FeedbackValue) => {
      const resolved = current === next ? null : next
      if (value === undefined) setInternalValue(resolved)
      onValueChange?.(resolved)
    }

    const actionClass =
      'h-7 w-7 p-0 text-muted-foreground hover:text-foreground'

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Rate this response"
        className={cn('flex items-center gap-0.5', className)}
        {...props}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(actionClass, current === 'up' && 'bg-accent text-foreground')}
          aria-label="Good response"
          aria-pressed={current === 'up'}
          onClick={() => select('up')}
        >
          <ThumbsUpIcon className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            actionClass,
            current === 'down' && 'bg-accent text-foreground'
          )}
          aria-label="Bad response"
          aria-pressed={current === 'down'}
          onClick={() => select('down')}
        >
          <ThumbsDownIcon className="h-3.5 w-3.5" />
        </Button>

        {onRegenerate && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={actionClass}
              aria-label="Regenerate response"
              onClick={onRegenerate}
            >
              <RefreshIcon className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    )
  }
)
Feedback.displayName = 'Feedback'

export { Feedback }
