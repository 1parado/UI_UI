import * as React from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { cn } from '@/lib/utils'
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  LoaderIcon,
} from '@/lib/icons'

export type ToolCallStatus = 'running' | 'success' | 'error'

const statusText: Record<ToolCallStatus, string> = {
  running: 'Running',
  success: 'Done',
  error: 'Failed',
}

function formatDuration(durationMs: number): string {
  return durationMs < 1000
    ? `${Math.round(durationMs)}ms`
    : `${(durationMs / 1000).toFixed(1)}s`
}

export interface ToolCallCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tool name, e.g. `web_search`. Rendered monospace. */
  name: string
  status?: ToolCallStatus
  /** One-line summary that stays visible while collapsed. */
  summary?: string
  /** Wall time in milliseconds — shown as `840ms` / `1.2s`. */
  durationMs?: number
  /** Start expanded. Defaults to false. */
  defaultOpen?: boolean
}

/**
 * One tool call from an agent turn: status, name, summary, and a collapsible
 * body for parameters and results. Compose the body with `ToolCallSection`.
 */
const ToolCallCard = React.forwardRef<HTMLDivElement, ToolCallCardProps>(
  (
    {
      className,
      name,
      status = 'success',
      summary,
      durationMs,
      defaultOpen = false,
      children,
      ...props
    },
    ref
  ) => (
    <Collapsible.Root
      ref={ref}
      defaultOpen={defaultOpen}
      className={cn(
        'rounded-lg border border-border bg-background text-sm',
        className
      )}
      {...props}
    >
      <Collapsible.Trigger className="group/tool flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none">
        {status === 'running' ? (
          <LoaderIcon className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" />
        ) : status === 'error' ? (
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 text-destructive" />
        ) : (
          <CheckIcon className="h-3.5 w-3.5 shrink-0 text-success" />
        )}
        <span className="font-mono text-xs font-medium">{name}</span>
        {summary && (
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {summary}
          </span>
        )}
        <span className="sr-only">{statusText[status]}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {durationMs !== undefined && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(durationMs)}
            </span>
          )}
          <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]/tool:rotate-90 motion-reduce:transition-none" />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="space-y-3 border-t border-border px-3 py-2.5">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
)
ToolCallCard.displayName = 'ToolCallCard'

export interface ToolCallSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Section heading, e.g. "Parameters" or "Result". */
  label: string
}

/** Labelled block inside a tool call body. */
const ToolCallSection = React.forwardRef<HTMLDivElement, ToolCallSectionProps>(
  ({ className, label, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1.5', className)} {...props}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  )
)
ToolCallSection.displayName = 'ToolCallSection'

export type ToolCallCodeProps = React.HTMLAttributes<HTMLPreElement>

/** Monospace payload block — parameters, raw results. */
const ToolCallCode = React.forwardRef<HTMLPreElement, ToolCallCodeProps>(
  ({ className, ...props }, ref) => (
    <pre
      ref={ref}
      className={cn(
        'overflow-x-auto rounded-md bg-muted px-2.5 py-2 font-mono text-xs leading-relaxed',
        className
      )}
      {...props}
    />
  )
)
ToolCallCode.displayName = 'ToolCallCode'

export interface AgentStepProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Step title, e.g. "Search the web". */
  title: string
  status?: ToolCallStatus
  /** Optional second line — what the step found. */
  description?: React.ReactNode
}

/** A single node in an agent chain. The connector hides on the last step. */
const AgentStep = React.forwardRef<HTMLLIElement, AgentStepProps>(
  ({ className, title, status = 'success', description, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('group/step relative flex gap-3 pb-4 last:pb-0', className)}
      {...props}
    >
      <span className="relative flex w-2 shrink-0 justify-center">
        <span
          aria-hidden="true"
          className={cn(
            'mt-1.5 h-2 w-2 rounded-full',
            status === 'running' &&
              'animate-pulse bg-muted-foreground motion-reduce:animate-none',
            status === 'success' && 'bg-success',
            status === 'error' && 'bg-destructive'
          )}
        />
        <span
          aria-hidden="true"
          className="absolute top-4 bottom-0 w-px bg-border group-last/step:hidden"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <span className="sr-only">{statusText[status]}</span>
    </li>
  )
)
AgentStep.displayName = 'AgentStep'

export type AgentStepListProps = React.OlHTMLAttributes<HTMLOListElement>

/** Ordered container for `AgentStep`s. */
const AgentStepList = React.forwardRef<HTMLOListElement, AgentStepListProps>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
  )
)
AgentStepList.displayName = 'AgentStepList'

export {
  ToolCallCard,
  ToolCallSection,
  ToolCallCode,
  AgentStep,
  AgentStepList,
}
