import * as React from 'react'
import { cn } from '@/lib/utils'
import { FileIcon, ImageIcon, XIcon } from '@/lib/icons'

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** File name. */
  name: string
  /** Formatted size, e.g. `1.5 MB`. Use `formatBytes` if you only have bytes. */
  size?: string
  /** Thumbnail URL. Falls back to a type icon. */
  thumbnailUrl?: string
  /** Picks the fallback icon. Defaults to `file`. */
  type?: 'file' | 'image'
  /** Renders a remove button when provided. */
  onRemove?: () => void
}

/** One attachment chip: preview, name, size, remove. */
const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  (
    { className, name, size, thumbnailUrl, type = 'file', onRemove, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex max-w-[16rem] items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5',
        className
      )}
      {...props}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="h-6 w-6 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground">
          {type === 'image' ? (
            <ImageIcon className="h-3.5 w-3.5" />
          ) : (
            <FileIcon className="h-3.5 w-3.5" />
          )}
        </span>
      )}

      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">{name}</span>
        {size && (
          <span className="block text-xs text-muted-foreground tabular-nums">
            {size}
          </span>
        )}
      </span>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  )
)
Attachment.displayName = 'Attachment'

export type AttachmentListProps = React.HTMLAttributes<HTMLDivElement>

/** Wrapping row of attachments — at home above a `ComposerTextarea`. */
const AttachmentList = React.forwardRef<HTMLDivElement, AttachmentListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
)
AttachmentList.displayName = 'AttachmentList'

export { AttachmentList, Attachment }
