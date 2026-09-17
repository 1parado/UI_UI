import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  type MentionOption,
  activeMention,
  applyMention,
  matchMentions,
  nextActiveIndex,
} from '@/lib/mentions'
import { useControllableString } from '@/lib/use-controllable-state'

export interface MentionsProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'children'
  > {
  options: (string | MentionOption)[]
  /** The field's text. Omit to let the component hold it. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** A mention was accepted. */
  onSelect?: (key: string, option: MentionOption) => void
  /** Character that opens the menu. Defaults to `"@"`. */
  trigger?: string
  /** Render a `textarea` instead of an `input`. */
  multiline?: boolean
  rows?: number
  maxSuggestions?: number
  /** Let spaces sit inside the handle, for names like "Ada Lov". */
  allowSpaceInQuery?: boolean
  emptyText?: React.ReactNode
}

/**
 * `@`-mentions inside ordinary text.
 *
 * Everything here is derived from the caret rather than kept as state: on
 * every keystroke the text before the caret decides whether the caret is
 * inside a mention (`lib/mentions`), which is why pressing Escape and carrying
 * on typing behaves correctly for free — there is no "mention mode" to leave.
 *
 * A pick splices the handle in place rather than appending, so mentioning
 * somebody mid-sentence keeps the sentence intact.
 *
 * ```tsx
 * <Mentions options={team} multiline rows={4} placeholder="Leave a note…" />
 * ```
 */
const Mentions = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  MentionsProps
>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      onSelect,
      trigger = '@',
      multiline = false,
      rows = 3,
      maxSuggestions,
      allowSpaceInQuery = false,
      placeholder = 'Type @ to mention…',
      emptyText = 'Nobody by that name',
      className,
      ...props
    },
    ref
  ) => {
    const [text, setText] = useControllableString({
      value,
      defaultValue,
      onValueChange: onChange,
    })

    const fieldRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const caretAfterRender = React.useRef<number | null>(null)
    const [open, setOpen] = React.useState(false)
    const [active, setActive] = React.useState(-1)

    const setRefs = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      fieldRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const write = (next: string, caret: number) => {
      setText(next)
      caretAfterRender.current = caret
    }

    // Setting the caret has to wait for React to have written the new value
    // into the DOM — an earlier call lands on the old text.
    React.useLayoutEffect(() => {
      if (caretAfterRender.current === null) return
      const field = fieldRef.current
      if (field) {
        field.focus()
        field.setSelectionRange(caretAfterRender.current, caretAfterRender.current)
      }
      caretAfterRender.current = null
    })

    const suggestions = React.useMemo(() => {
      const caret = fieldRef.current?.selectionStart ?? text.length
      const match = activeMention(text, caret, trigger, { allowSpace: allowSpaceInQuery })
      return { match, list: match ? matchMentions(options, match.query, maxSuggestions) : [] }
    }, [text, options, trigger, allowSpaceInQuery, maxSuggestions])

    const accept = (option: MentionOption) => {
      const match = suggestions.match
      if (!match || option.disabled === true) return

      const next = applyMention(text, match, trigger, option.key)
      write(next.text, next.caret)
      onSelect?.(option.key, option)
      setOpen(false)
      setActive(-1)
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
      if (!open || suggestions.list.length === 0) {
        if (event.key === 'Escape') setOpen(false)
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActive((current) => nextActiveIndex(suggestions.list, current, 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setActive((current) => nextActiveIndex(suggestions.list, current, -1))
          break
        case 'Enter':
        case 'Tab': {
          const option = suggestions.list[active]
          if (!option || option.disabled === true) return
          event.preventDefault()
          accept(option)
          break
        }
        case 'Escape':
          event.preventDefault()
          setOpen(false)
          setActive(-1)
          break
        default:
          break
      }
    }

    // Both elements take the same handful of props; only `rows` and the
    // element itself differ, so the shared bag is typed against the union and
    // each branch narrows it by construction.
    const shared = {
      value: text,
      placeholder,
      role: 'combobox' as const,
      'aria-expanded': open && suggestions.list.length > 0,
      'aria-autocomplete': 'list' as const,
      className: cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        multiline && 'min-h-[4.5rem] resize-y',
        className
      ),
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setText(event.target.value)
        setOpen(true)
        setActive(-1)
      },
      onKeyDown,
      onBlur: () => setOpen(false),
    }

    return (
      <div className="relative w-full">
        // The shared attribute bag is declared once against `textarea`, since
        // that is the wider element; a text field takes exactly the same
        // handlers, and the two are spread onto whichever element after the
        // one cast this needs.
        {multiline ? (
          <textarea rows={rows} {...shared} ref={setRefs} {...props} />
        ) : (
          <input
            type="text"
            {...shared}
            ref={setRefs}
            {...(props as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {open && suggestions.list.length > 0 && (
          <ul
            role="listbox"
            aria-label="Mentions"
            className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {suggestions.list.map((option, index) => (
              <li
                key={option.key}
                role="option"
                aria-selected={index === active}
                aria-disabled={option.disabled === true || undefined}
                // Keeping focus in the field is what lets the user carry on
                // typing after looking at the menu.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => accept(option)}
                className={cn(
                  'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                  index === active && 'bg-accent text-accent-foreground',
                  option.disabled === true && 'cursor-not-allowed opacity-50'
                )}
              >
                <span className="block truncate">{option.label}</span>
                {option.description && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {open && suggestions.list.length === 0 && suggestions.match && (
          <p className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover px-2 py-3 text-center text-sm text-muted-foreground shadow-md">
            {emptyText}
          </p>
        )}
      </div>
    )
  }
)
Mentions.displayName = 'Mentions'

export { Mentions }
