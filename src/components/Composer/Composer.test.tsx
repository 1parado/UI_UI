import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Composer,
  ComposerHint,
  ComposerSubmit,
  ComposerTextarea,
} from './Composer'

function renderComposer(props: {
  streaming?: boolean
  submitOnEnter?: boolean
} = {}) {
  const onSubmit = vi.fn()
  const onStop = vi.fn()

  render(
    <Composer onSubmit={onSubmit} onStop={onStop} {...props}>
      <ComposerTextarea placeholder="Ask anything" />
      <ComposerHint>hint</ComposerHint>
      <ComposerSubmit />
    </Composer>
  )

  return { onSubmit, onStop }
}

describe('Composer', () => {
  it('submits on Enter and clears the field', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer()
    const textarea = screen.getByPlaceholderText('Ask anything')

    await user.type(textarea, 'why the 401?{Enter}')

    expect(onSubmit).toHaveBeenCalledWith('why the 401?')
    expect(textarea).toHaveValue('')
  })

  it('inserts a newline on Shift+Enter instead of submitting', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer()
    const textarea = screen.getByPlaceholderText('Ask anything')

    await user.type(textarea, 'line one{Shift>}{Enter}{/Shift}line two')

    expect(onSubmit).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('line one\nline two')
  })

  it('does not submit while an IME composition is active', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer()
    const textarea = screen.getByPlaceholderText('Ask anything')

    await user.type(textarea, '你好')
    fireEvent.compositionStart(textarea)
    fireEvent.keyDown(textarea, { key: 'Enter' })
    fireEvent.compositionEnd(textarea)

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ignores whitespace-only input', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer()

    await user.type(screen.getByPlaceholderText('Ask anything'), '   {Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps the send button disabled until there is text', async () => {
    const user = userEvent.setup()
    renderComposer()
    const send = screen.getByRole('button', { name: 'Send message' })

    expect(send).toBeDisabled()
    await user.type(screen.getByPlaceholderText('Ask anything'), 'hello')
    expect(send).toBeEnabled()
  })

  it('swaps send for stop while streaming and does not submit', async () => {
    const user = userEvent.setup()
    const { onSubmit, onStop } = renderComposer({ streaming: true })

    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Stop generating' }))
    expect(onStop).toHaveBeenCalledTimes(1)

    await user.type(
      screen.getByPlaceholderText('Ask anything'),
      'queued{Enter}'
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits on click as well as Enter', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer()

    await user.type(screen.getByPlaceholderText('Ask anything'), 'run the tests')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(onSubmit).toHaveBeenCalledWith('run the tests')
  })

  it('honours submitOnEnter={false}', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderComposer({ submitOnEnter: false })
    const textarea = screen.getByPlaceholderText('Ask anything')

    await user.type(textarea, 'no submit{Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
    // Enter falls through to the textarea, which inserts a newline.
    expect(textarea).toHaveValue('no submit\n')
  })
})
