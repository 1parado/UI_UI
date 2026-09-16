import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type MessageRole = 'user' | 'assistant' | 'system'

const MessageContext = React.createContext<{ role: MessageRole }>({
  role: 'assistant',
})

const messageVariants = cva('group/message flex w-full gap-3', {
  variants: {
    role: {
      user: 'flex-row-reverse',
      assistant: 'items-start',
      system: 'justify-center',
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
})

export interface MessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /**
   * Who produced the message — drives layout and surface treatment.
   * `data-role` is exposed for consumer styling hooks.
   */
  role?: MessageRole
}

/**
 * Root of a single turn. Assistant replies read as a document, user turns get a
 * quiet bubble, system turns are a centered note.
 */
const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, role = 'assistant', children, ...props }, ref) => (
    <MessageContext.Provider value={{ role }}>
      <div
        ref={ref}
        data-role={role}
        className={cn(messageVariants({ role }), className)}
        {...props}
      >
        {children}
      </div>
    </MessageContext.Provider>
  )
)
Message.displayName = 'Message'

export type MessageAvatarProps = React.HTMLAttributes<HTMLDivElement>

/** Fixed-width slot that keeps avatars aligned across the stream. */
const MessageAvatar = React.forwardRef<HTMLDivElement, MessageAvatarProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex size-8 shrink-0 items-center justify-center',
      className
    )}
    {...props}
  />
))
MessageAvatar.displayName = 'MessageAvatar'

const messageContentVariants = cva('flex flex-col gap-2 text-sm', {
  variants: {
    role: {
      user: 'w-fit max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-secondary-foreground whitespace-pre-wrap break-words',
      assistant: 'min-w-0 flex-1 text-foreground',
      system: 'rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground',
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
})

export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Body of the message. `MessageActions` belongs inside it so the actions sit
 * with the content instead of floating at the end of the row.
 */
const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, ...props }, ref) => {
    const { role } = React.useContext(MessageContext)

    return (
      <div
        ref={ref}
        className={cn(messageContentVariants({ role }), className)}
        {...props}
      />
    )
  }
)
MessageContent.displayName = 'MessageContent'

export type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Action row (copy / retry / delete). Kept at reduced opacity rather than
 * hidden, so touch users can still see and reach it.
 */
const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ className, ...props }, ref) => {
    const { role } = React.useContext(MessageContext)

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1 pt-1 opacity-60 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100 motion-reduce:transition-none',
          role === 'user' && 'justify-end',
          className
        )}
        {...props}
      />
    )
  }
)
MessageActions.displayName = 'MessageActions'

export { Message, MessageAvatar, MessageContent, MessageActions }
