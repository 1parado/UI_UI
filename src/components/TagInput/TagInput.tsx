import * as React from 'react'
import { cn } from '@/lib/utils'
import { XIcon } from '@/lib/icons'
import { useControllableStringArray } from '@/lib/use-controllable-state'

export interface TagInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    // `onInvalid` is the DOM's form-validation event; this component uses the
    // name for its own rejection callback, so the native one steps aside.
    'onChange' | 'defaultValue' | 'children' | 'onInvalid'
  > {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Cap on how many tags can be added. The input disables itself at the limit. */
  max?: number
  /** Reject a tag by returning `false`. */
  validate?: (tag: string) => boolean
  /** Called with the raw text when `validate` rejects it. */
  onInvalid?: (tag: string) => void
  /** Keep entries that are already in the list. Off by default. */
  allowDuplicates?: boolean
  disabled?: boolean
  /** Error styling and `aria-invalid`, matching `Input`. */
  invalid?: boolean
  id?: string
  name?: string
  'aria-describedby'?: string
}

/**
 * Free-text tags — labels on a conversation, filters, recipients.
 *
 * Enter or comma commits, Backspace on an empty field removes the last tag, and
 * clicking the field focuses the input even though the tags sit inside it.
 *
 * ```tsx
 * <TagInput defaultValue={['beta']} placeholder="Add a label…" max={5} />
 * ```
 */
const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Add a tag…',
      max,
      validate,
      onInvalid,
      allowDuplicates = false,
      disabled = false,
      invalid = false,
      id,
      name,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [tags, setTags] = useControllableStringArray({ value, defaultValue, onValueChange })
    const [draft, setDraft] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    const atLimit = max !== undefined && tags.length >= max

    const addTag = (raw: string) => {
      const next = raw.trim()
      if (!next || atLimit) return

      if (!allowDuplicates && tags.includes(next)) {
        setDraft('')
        return
      }

      if (validate && !validate(next)) {
        onInvalid?.(next)
        return
      }

      setTags([...tags, next])
      setDraft('')
    }

    const removeTag = (index: number) => {
      setTags(tags.filter((_, position) => position !== index))
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // An IME commits with the same Enter key, so typing a candidate would
      // otherwise add a tag and swallow the character.
      if (event.nativeEvent.isComposing) return

      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        addTag(draft)
        return
      }

      if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
        event.preventDefault()
        removeTag(tags.length - 1)
      }
    }

    return (
      <div
        ref={ref}
        data-slot="tag-input"
        data-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          invalid && 'border-destructive ring-destructive/20 focus-within:ring-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={() => inputRef.current?.focus()}
        {...props}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            data-slot="tag"
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {tag}
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
              onClick={(event) => {
                // Otherwise the container's click handler steals focus back and
                // the caret jumps to the end of the field.
                event.stopPropagation()
                removeTag(index)
              }}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={draft}
          disabled={disabled || atLimit}
          aria-describedby={ariaDescribedBy}
          aria-invalid={invalid || undefined}
          placeholder={tags.length === 0 ? placeholder : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          className="h-6 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
        />
      </div>
    )
  }
)
TagInput.displayName = 'TagInput'

export { TagInput }
