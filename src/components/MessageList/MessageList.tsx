import * as React from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ScrollArea'
import { Button } from '../Button'
import { ChevronDownIcon } from '@/lib/icons'

/** Distance from the bottom (px) that still counts as "parked at the bottom". */
const AT_BOTTOM_THRESHOLD = 32

export interface MessageListHandle {
  /** Jump to the newest message — anchors, "jump to latest", retry-after-edit. */
  scrollToBottom: (behavior?: ScrollBehavior) => void
}

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Follow new content while the reader is parked at the bottom. Following
   * pauses as soon as they scroll up and resumes when they return, so streamed
   * tokens never yank the viewport away from something being read.
   * Defaults to true.
   */
  autoScroll?: boolean
}

/**
 * Scrolling container for a stream of `Message`s. Give it a height (or
 * `flex-1 min-h-0` inside a column) — the viewport needs a bound.
 */
const MessageList = React.forwardRef<MessageListHandle, MessageListProps>(
  ({ className, autoScroll = true, children, ...props }, ref) => {
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [atBottom, setAtBottom] = React.useState(true)

    // Mirrored in refs so the observers below never need to re-subscribe.
    const autoScrollRef = React.useRef(autoScroll)
    autoScrollRef.current = autoScroll
    const atBottomRef = React.useRef(atBottom)
    atBottomRef.current = atBottom

    const scrollToBottom = React.useCallback(
      (behavior: ScrollBehavior = 'smooth') => {
        const viewport = viewportRef.current
        if (!viewport) return
        viewport.scrollTo({ top: viewport.scrollHeight, behavior })
      },
      []
    )

    React.useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom])

    React.useEffect(() => {
      const viewport = viewportRef.current
      if (!viewport) return

      const handleScroll = () => {
        const distance =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
        setAtBottom(distance <= AT_BOTTOM_THRESHOLD)
      }

      handleScroll()
      viewport.addEventListener('scroll', handleScroll, { passive: true })
      return () => viewport.removeEventListener('scroll', handleScroll)
    }, [])

    // Follow the content as it grows (streaming tokens change its height).
    React.useEffect(() => {
      const content = contentRef.current
      if (!content || typeof ResizeObserver === 'undefined') return

      const observer = new ResizeObserver(() => {
        const viewport = viewportRef.current
        if (!viewport || !autoScrollRef.current || !atBottomRef.current) return
        viewport.scrollTop = viewport.scrollHeight
      })

      observer.observe(content)
      return () => observer.disconnect()
    }, [])

    return (
      <div
        className={cn('relative flex min-h-0 flex-col', className)}
        {...props}
      >
        <ScrollArea viewportRef={viewportRef} className="min-h-0 flex-1">
          <div ref={contentRef} className="flex flex-col gap-4 p-4">
            {children}
          </div>
        </ScrollArea>

        {!atBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="pointer-events-auto shadow-sm"
              onClick={() => scrollToBottom()}
            >
              <ChevronDownIcon className="h-3.5 w-3.5" />
              Jump to latest
            </Button>
          </div>
        )}
      </div>
    )
  }
)
MessageList.displayName = 'MessageList'

export { MessageList }
