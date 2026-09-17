import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/format'
import { describeAccept, matchesAccept } from '@/lib/upload'
import { useControllableState } from '@/lib/use-controllable-state'
import { Progress } from '@/components/Progress'
import {
  AlertCircleIcon,
  CheckIcon,
  FileIcon,
  LoaderIcon,
  RefreshIcon,
  UploadCloudIcon,
  XIcon,
} from '@/lib/icons'

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UploadItem {
  id: string
  file: File
  status: UploadStatus
  /** 0–100. */
  progress: number
  error?: string
}

export type UploadRejectReason = 'type' | 'size' | 'count'

export interface UploadRejection {
  file: File
  reason: UploadRejectReason
}

export interface UploadHandlerOptions {
  /** Report 0–100 as the transfer advances. */
  onProgress: (percent: number) => void
  /** Aborted when the item is removed or the component unmounts. */
  signal: AbortSignal
}

export type UploadHandler = (
  file: File,
  options: UploadHandlerOptions
) => void | Promise<void>

export interface FileUploadLabels {
  drop?: string
  browse?: string
  tooLarge?: string
  wrongType?: string
  tooMany?: string
  rejected?: (count: number) => string
  remove?: (name: string) => string
  retry?: (name: string) => string
  clearAll?: string
}

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError'> {
  /** The picker's `accept` list, e.g. `"image/*,.pdf"`. Also enforced on drop. */
  accept?: string
  /** Allow more than one file. Defaults to `true`. */
  multiple?: boolean
  /** Ceiling per file, in bytes. */
  maxSize?: number
  /** Ceiling on the queue. Extra files are rejected, not queued. */
  maxFiles?: number
  disabled?: boolean
  /**
   * Runs the upload. Leave it out to drive the queue yourself: items are added
   * with `pending` and nothing starts them.
   */
  upload?: UploadHandler
  /** Own the queue, or let the component hold it with `defaultFiles`. */
  files?: UploadItem[]
  defaultFiles?: UploadItem[]
  onFilesChange?: (files: UploadItem[]) => void
  /** A file that never made it into the queue, and why. */
  onReject?: (rejections: UploadRejection[]) => void
  /** A file that finished. */
  onComplete?: (item: UploadItem) => void
  /** Replaces the generated accept / size hint. */
  hint?: React.ReactNode
  /** Show the queue below the drop zone. Defaults to `true`. */
  list?: boolean
  labels?: FileUploadLabels
}

const DEFAULT_LABELS: Required<FileUploadLabels> = {
  drop: 'Drag files here',
  browse: 'or click to browse',
  tooLarge: 'too large',
  wrongType: 'wrong type',
  tooMany: 'over the limit',
  rejected: (count: number) => `${count} file${count === 1 ? '' : 's'} rejected`,
  remove: (name: string) => `Remove ${name}`,
  retry: (name: string) => `Retry ${name}`,
  clearAll: 'Remove all files',
}

const statusIcon = (status: UploadStatus) => {
  if (status === 'success') return <CheckIcon className="h-3.5 w-3.5 text-success" />
  if (status === 'error') return <AlertCircleIcon className="h-3.5 w-3.5 text-destructive" />
  if (status === 'uploading') {
    return <LoaderIcon className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
  }
  return <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
}

/**
 * A drop zone and the queue behind it: pick or drop, validate, upload, retry.
 *
 * The queue is owned here unless you pass `files` — the same controlled /
 * uncontrolled contract as the rest of the library. Two consequences worth
 * knowing:
 *
 * - **Validation runs on dropped files too.** `input.accept` only filters the
 *   file picker; a folder dragged onto the page never passes through it, so the
 *   same rules are applied by hand. Rejections go to `onReject` and are listed
 *   under the zone.
 * - **Every pending item starts immediately** once `upload` is given, and an
 *   upload is aborted when its item is removed or the component unmounts. That
 *   means the caller's handler gets a `signal`, and must pass it to `fetch`.
 *
 * ```tsx
 * <FileUpload
 *   accept="image/*,.pdf"
 *   maxSize={8 * 1024 * 1024}
 *   upload={async (file, { onProgress, signal }) => {
 *     await post(file, { signal, onProgress })
 *   }}
 * />
 * ```
 */
const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      accept,
      multiple = true,
      maxSize,
      maxFiles,
      disabled = false,
      upload,
      files,
      defaultFiles,
      onFilesChange,
      onReject,
      onComplete,
      hint,
      list = true,
      labels,
      ...props
    },
    ref
  ) => {
    const text = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])
    const [queue, setQueue] = useControllableState<UploadItem[]>({
      value: files,
      defaultValue: defaultFiles ?? [],
      onValueChange: onFilesChange,
    })

    const [rejections, setRejections] = React.useState<UploadRejection[]>([])
    const [dragging, setDragging] = React.useState(false)
    const dragDepth = React.useRef(0)

    const inputRef = React.useRef<HTMLInputElement>(null)
    const controllers = React.useRef(new Map<string, AbortController>())
    const idRef = React.useRef(0)
    const idPrefix = React.useId()

    React.useEffect(() => {
      const running = controllers.current
      return () => {
        for (const controller of running.values()) controller.abort()
        running.clear()
      }
    }, [])

    const patch = React.useCallback(
      (id: string, changes: Partial<UploadItem>) =>
        setQueue((previous) =>
          previous.map((item) => (item.id === id ? { ...item, ...changes } : item))
        ),
      [setQueue]
    )

    const run = React.useCallback(
      (item: UploadItem) => {
        if (!upload) return
        const controller = new AbortController()
        controllers.current.set(item.id, controller)

        Promise.resolve(
          upload(item.file, {
            onProgress: (percent) =>
              patch(item.id, { status: 'uploading', progress: Math.min(100, Math.max(0, percent)) }),
            signal: controller.signal,
          })
        )
          .then(() => {
            controllers.current.delete(item.id)
            if (controller.signal.aborted) return
            patch(item.id, { status: 'success', progress: 100 })
            onComplete?.({ ...item, status: 'success', progress: 100 })
          })
          .catch((error: unknown) => {
            controllers.current.delete(item.id)
            if (controller.signal.aborted) return
            patch(item.id, {
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed',
            })
          })
      },
      // `patch` reads the queue through a ref, so this stays stable across the
      // progress updates that come back from an in-flight upload.
      [upload, patch, onComplete]
    )

    const started = React.useRef(new Set<string>())

    React.useEffect(() => {
      if (!upload) return
      for (const item of queue) {
        if (item.status !== 'pending' || started.current.has(item.id)) continue
        started.current.add(item.id)
        run(item)
      }
    }, [queue, upload, run])

    const add = (incoming: File[]) => {
      if (disabled || incoming.length === 0) return

      // A single-file zone takes the first file and says the rest were over the
      // limit, rather than silently dropping them.
      const candidates = multiple ? incoming : incoming.slice(0, 1)
      const rejected: UploadRejection[] = multiple
        ? []
        : incoming.slice(1).map((file) => ({ file, reason: 'count' as const }))
      const accepted: File[] = []
      const room = maxFiles === undefined ? Infinity : maxFiles - (multiple ? queue.length : 0)

      for (const file of candidates) {
        if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'type' })
        else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size' })
        else if (accepted.length >= room) rejected.push({ file, reason: 'count' })
        else accepted.push(file)
      }

      setRejections(rejected)
      if (rejected.length > 0) onReject?.(rejected)
      if (accepted.length === 0) return

      const items = accepted.map((file) => ({
        id: `${idPrefix}-${++idRef.current}`,
        file,
        status: 'pending' as const,
        progress: 0,
      }))

      // A single-file zone replaces what is there; a multi-file one appends.
      setQueue((previous) => (multiple ? [...previous, ...items] : items))
    }

    const remove = (id: string) => {
      controllers.current.get(id)?.abort()
      controllers.current.delete(id)
      started.current.delete(id)
      setQueue((previous) => previous.filter((item) => item.id !== id))
    }

    const retry = (id: string) => {
      controllers.current.get(id)?.abort()
      controllers.current.delete(id)
      started.current.delete(id)
      patch(id, { status: 'pending', progress: 0, error: undefined })
    }

    const clearAll = () => {
      for (const controller of controllers.current.values()) controller.abort()
      controllers.current.clear()
      started.current.clear()
      setRejections([])
      setQueue([])
    }

    const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      add(Array.from(event.dataTransfer?.files ?? []))
    }

    const autoHint = [
      accept ? describeAccept(accept) : '',
      maxSize !== undefined ? `up to ${formatBytes(maxSize)}` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    const reasonText = (reason: UploadRejectReason) =>
      reason === 'type' ? text.wrongType : reason === 'size' ? text.tooLarge : text.tooMany

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(event) => {
            add(Array.from(event.target.files ?? []))
            // Let the same file be picked again after a removal.
            event.target.value = ''
          }}
        />

        <button
          type="button"
          disabled={disabled}
          data-dragging={dragging || undefined}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            dragDepth.current += 1
            if (!disabled) setDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1)
            if (dragDepth.current === 0) setDragging(false)
          }}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-4 py-6 text-center',
            'transition-colors hover:bg-muted/50',
            'data-[dragging]:border-primary data-[dragging]:bg-primary/5',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          )}
        >
          <UploadCloudIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">{text.drop}</span>
          <span className="text-xs text-muted-foreground">{text.browse}</span>
          {(hint ?? autoHint) && (
            <span className="mt-1 text-xs text-muted-foreground">{hint ?? autoHint}</span>
          )}
        </button>

        {rejections.length > 0 && (
          <div data-upload-rejected className="space-y-0.5">
            <p className="text-xs font-medium text-destructive">
              {text.rejected(rejections.length)}
            </p>
            <ul className="space-y-0.5">
              {rejections.map((rejection, index) => (
                <li key={index} className="truncate text-xs text-muted-foreground">
                  {rejection.file.name} · {reasonText(rejection.reason)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {list && queue.length > 0 && (
          <ul className="space-y-1">
            {queue.map((item) => (
              <li
                key={item.id}
                data-upload-status={item.status}
                className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
              >
                <span aria-hidden="true" className="shrink-0">
                  {statusIcon(item.status)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-sm">{item.file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                    </span>
                  </span>

                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="mt-1 h-1" />
                  )}
                  {item.status === 'error' && item.error && (
                    <span className="block truncate text-xs text-destructive">{item.error}</span>
                  )}
                </span>

                {item.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => retry(item.id)}
                    aria-label={text.retry(item.file.name)}
                    className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                  >
                    <RefreshIcon className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={text.remove(item.file.name)}
                  className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}

            {queue.length > 1 && (
              <li>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {text.clearAll}
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
