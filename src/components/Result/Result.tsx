import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  AlertTriangleIcon,
  BanIcon,
  CheckCircleIcon,
  InfoIcon,
  SearchIcon,
  XCircleIcon,
} from '@/lib/icons'

export type ResultStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | '404'
  | '403'
  | '500'

export interface ResultProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Picks the default icon and its colour. Purely presentational — it says
   * nothing about what happened, so pass the `status` that matches the
   * outcome the reader should understand, not the HTTP code you happened to
   * receive.
   */
  status?: ResultStatus
  /** Heading. Rendered as an `<h2>`, since a result is a section of its page. */
  title: React.ReactNode
  /** One line of explanation under the heading. */
  subTitle?: React.ReactNode
  /** Buttons or links. */
  extra?: React.ReactNode
  /** Replaces the status icon entirely. */
  icon?: React.ReactNode
}

const statusIcon: Record<ResultStatus, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
  '404': SearchIcon,
  '403': BanIcon,
  '500': XCircleIcon,
}

const statusTone: Record<ResultStatus, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
  '404': 'text-muted-foreground',
  '403': 'text-warning',
  '500': 'text-destructive',
}

/**
 * The end of a flow: a payment went through, a link is dead, a save failed.
 *
 * A result page is mostly whitespace and one decision, so this is a block
 * rather than a full-page component — it does not set a height, centre itself
 * in the viewport, or take over the document title. Drop it in whatever
 * layout you already have.
 *
 * ```tsx
 * <Result
 *   status="success"
 *   title="Payment received"
 *   subTitle="A receipt is on its way to you@example.com."
 *   extra={<Button>Back to dashboard</Button>}
 * />
 * ```
 */
const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (
    { className, status = 'info', title, subTitle, extra, icon, children, ...props },
    ref
  ) => {
    const StatusIcon = statusIcon[status]

    return (
      <div
        ref={ref}
        data-slot="result"
        data-status={status}
        className={cn('flex flex-col items-center px-6 py-12 text-center', className)}
        {...props}
      >
        <div className={cn('mb-4', statusTone[status])} data-slot="result-icon">
          {icon ?? <StatusIcon className="size-12" aria-hidden />}
        </div>

        <h2
          data-slot="result-title"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>

        {subTitle && (
          <p
            data-slot="result-subtitle"
            className="mt-2 max-w-md text-sm text-muted-foreground"
          >
            {subTitle}
          </p>
        )}

        {children && <div className="mt-6 w-full max-w-lg">{children}</div>}

        {extra && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {extra}
          </div>
        )}
      </div>
    )
  }
)
Result.displayName = 'Result'

export { Result }
