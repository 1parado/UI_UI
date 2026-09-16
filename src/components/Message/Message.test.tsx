import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Message, MessageActions, MessageContent } from './Message'

describe('Message', () => {
  it('exposes the role as a data attribute rather than an ARIA role', () => {
    const { container } = render(
      <Message role="user">
        <MessageContent>Why the 401?</MessageContent>
      </Message>
    )
    const root = container.firstElementChild as HTMLElement

    expect(root).toHaveAttribute('data-role', 'user')
    // `user` is not a valid ARIA role — it must not reach the DOM as one.
    expect(root).not.toHaveAttribute('role')
  })

  it('defaults to the assistant role', () => {
    const { container } = render(
      <Message>
        <MessageContent>Await the refresh first.</MessageContent>
      </Message>
    )

    expect(container.firstElementChild).toHaveAttribute(
      'data-role',
      'assistant'
    )
  })

  it('aligns user actions to the end of the row', () => {
    render(
      <Message role="user">
        <MessageContent>Why the 401?</MessageContent>
        <MessageActions data-testid="actions" />
      </Message>
    )

    expect(screen.getByTestId('actions')).toHaveClass('justify-end')
  })

  it('keeps assistant actions aligned to the start', () => {
    render(
      <Message role="assistant">
        <MessageContent>Await the refresh first.</MessageContent>
        <MessageActions data-testid="actions" />
      </Message>
    )

    expect(screen.getByTestId('actions')).not.toHaveClass('justify-end')
  })

  it('leaves room for keyboard users by revealing actions on focus', () => {
    render(
      <Message role="assistant">
        <MessageContent>Await the refresh first.</MessageContent>
        <MessageActions data-testid="actions" />
      </Message>
    )

    expect(screen.getByTestId('actions')).toHaveClass('focus-within:opacity-100')
  })
})
