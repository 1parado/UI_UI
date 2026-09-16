import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../Button'
import { ArrowUpIcon, StopIcon } from '@/lib/icons'

type ComposerContextValue = {
  value: string
  setValue: (value: string) => void
  submit: () => void
  streaming: boolean
  onStop?: () => void
  submitOnEnter: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

const ComposerContext = React.createContext<ComposerContextValue | null>(null)

function useComposer() {
  const context = React.useContext(ComposerContext)
  if (!context) {
    throw new Error('Composer parts must be rendered inside <Composer>.')
  }
  return context
}

export interface ComposerProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    'onSubmit' | 'defaultValue'
  > {
  /** Called with the trimmed text when the user submits. */
  onSubmit?: (value: string) => void
  /** A generation is in flight — send swaps to stop. */
  streaming?: boolean
  onStop?: () => void
  /** Submit on Enter, newline on Shift+Enter. Defaults to true. */
  submitOnEnter?: boolean
  /** Initial text (uncontrolled). */
  defaultValue?: string
  /** Controlled text. Pair with `onValueChange`. */
  value?: string
  onValueChange?: (value: string) => void
}

/**
 * Prompt input surface. Owns the text, the submit rules and the keyboard
 * contract; the parts inside decide how it looks.
 *
 * ```tsx
 * <Composer onSubmit={send} streaming={isStreaming} onStop={stop}>
 *   <ComposerTextarea placeholder="Ask anything" />
 *   <ComposerToolbar>
 *     <ComposerHint>1.2K tokens</ComposerHint>
 *     <ComposerSubmit />
 *   </ComposerToolbar>
 * </Composer>
 * ```
 */
const Composer = React.forwardRef<HTMLFormElement, ComposerProps>(
  (
    {
      className,
      onSubmit,
      streaming = false,
      onStop,
      submitOnEnter = true,
      defaultValue = '',
      value,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const text = value ?? internalValue
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const setValue = React.useCallback(
      (next: string) => {
        if (value === undefined) setInternalValue(next)
        onValueChange?.(next)
      },
      [value, onValueChange]
    )

    const resize = React.useCallback(() => {
      const node = textareaRef.current
      if (!node) return
      node.style.height = 'auto'
      node.style.height = `${node.scrollHeight}px`
    }, [])

    // Keeps the box in sync with the text — including the reset after submit.
    React.useEffect(() => {
      resize()
    }, [text, resize])

    const submit = React.useCallback(() => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return
      onSubmit?.(trimmed)
      setValue('')
    }, [text, streaming, onSubmit, setValue])

    const contextValue = React.useMemo<ComposerContextValue>(
      () => ({
        value: text,
        setValue,
        submit,
        streaming,
        onStop,
        submitOnEnter,
        textareaRef,
      }),
      [text, setValue, submit, streaming, onStop, submitOnEnter]
    )

    return (
      <ComposerContext.Provider value={contextValue}>
        <form
          ref={ref}
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className={cn(
            'flex flex-col gap-2 rounded-lg border border-input bg-background p-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
          {...props}
        >
          {children}
        </form>
      </ComposerContext.Provider>
    )
  }
)
Composer.displayName = 'Composer'

export type ComposerTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>

/** Auto-growing textarea. Enter submits, Shift+Enter breaks the line. */
const ComposerTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ComposerTextareaProps
>(
  (
    {
      className,
      rows = 1,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      ...props
    },
    ref
  ) => {
    const { value, setValue, submit, submitOnEnter, textareaRef } = useComposer()
    const composingRef = React.useRef(false)

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) {
          ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node
        }
      },
      [ref, textareaRef]
    )

    return (
      <textarea
        ref={setRefs}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || event.key !== 'Enter') return
          if (event.shiftKey || !submitOnEnter) return
          // An active IME owns Enter (it confirms the candidate), so a Chinese
          // or Japanese composition never submits mid-word.
          if (composingRef.current || event.nativeEvent.isComposing) return
          event.preventDefault()
          submit()
        }}
        onCompositionStart={(event) => {
          composingRef.current = true
          onCompositionStart?.(event)
        }}
        onCompositionEnd={(event) => {
          composingRef.current = false
          onCompositionEnd?.(event)
        }}
        className={cn(
          'max-h-48 min-h-[44px] w-full resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
ComposerTextarea.displayName = 'ComposerTextarea'

export type ComposerToolbarProps = React.HTMLAttributes<HTMLDivElement>

/** Row under the textarea: attachments and hints left, actions right. */
const ComposerToolbar = React.forwardRef<HTMLDivElement, ComposerToolbarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 px-1', className)}
      {...props}
    />
  )
)
ComposerToolbar.displayName = 'ComposerToolbar'

export type ComposerHintProps = React.HTMLAttributes<HTMLSpanElement>

/** Quiet metadata next to the actions — token count, cost, shortcut. */
const ComposerHint = React.forwardRef<HTMLSpanElement, ComposerHintProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-xs text-muted-foreground tabular-nums', className)}
      {...props}
    />
  )
)
ComposerHint.displayName = 'ComposerHint'

export interface ComposerSubmitProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onClick' | 'type'> {
  /** Accessible name of the send state. Defaults to "Send message". */
  sendLabel?: string
  /** Accessible name of the stop state. Defaults to "Stop generating". */
  stopLabel?: string
}

/** Send / stop button. Reads the composer state, so it is never out of sync. */
const ComposerSubmit = React.forwardRef<HTMLButtonElement, ComposerSubmitProps>(
  (
    {
      className,
      disabled,
      sendLabel = 'Send message',
      stopLabel = 'Stop generating',
      ...props
    },
    ref
  ) => {
    const { value, streaming, onStop } = useComposer()

    if (streaming) {
      return (
        <Button
          ref={ref}
          type="button"
          variant="outline"
          size="icon"
          aria-label={stopLabel}
          className={cn('h-9 w-9', className)}
          onClick={() => onStop?.()}
          {...props}
        >
          <StopIcon className="h-4 w-4" />
        </Button>
      )
    }

    return (
      <Button
        ref={ref}
        type="submit"
        size="icon"
        aria-label={sendLabel}
        disabled={disabled || !value.trim()}
        className={cn('h-9 w-9', className)}
        {...props}
      >
        <ArrowUpIcon className="h-4 w-4" />
      </Button>
    )
  }
)
ComposerSubmit.displayName = 'ComposerSubmit'

export {
  Composer,
  ComposerTextarea,
  ComposerToolbar,
  ComposerHint,
  ComposerSubmit,
}
