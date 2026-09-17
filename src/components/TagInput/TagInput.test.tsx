import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagInput } from './TagInput'

const field = () => screen.getByRole('textbox')

describe('TagInput', () => {
  it('adds a tag on Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagInput onValueChange={onValueChange} />)

    await user.type(field(), 'design{Enter}')

    expect(onValueChange).toHaveBeenCalledWith(['design'])
  })

  it('adds a tag on comma', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    await user.type(field(), 'design,')

    expect(screen.getByText('design')).toBeInTheDocument()
  })

  it('trims what it was given', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    await user.type(field(), '  design  {Enter}')

    expect(screen.getByText('design')).toBeInTheDocument()
  })

  it('ignores a blank submit', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagInput onValueChange={onValueChange} />)

    await user.type(field(), '   {Enter}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('drops the last tag on Backspace in an empty field', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['alpha', 'beta']} />)

    await user.click(field())
    await user.keyboard('{Backspace}')

    expect(screen.queryByText('beta')).not.toBeInTheDocument()
    expect(screen.getByText('alpha')).toBeInTheDocument()
  })

  it('leaves existing tags alone when there is a draft', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['alpha']} />)

    await user.type(field(), 'b')
    await user.keyboard('{Backspace}')

    expect(screen.getByText('alpha')).toBeInTheDocument()
  })

  it('removes a tag from its own button', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['alpha', 'beta']} />)

    await user.click(screen.getByRole('button', { name: 'Remove alpha' }))

    expect(screen.queryByText('alpha')).not.toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })

  it('skips duplicates by default', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['design']} />)

    await user.type(field(), 'design{Enter}')

    expect(screen.getAllByText('design')).toHaveLength(1)
  })

  it('keeps duplicates when asked to', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['design']} allowDuplicates />)

    await user.type(field(), 'design{Enter}')

    expect(screen.getAllByText('design')).toHaveLength(2)
  })

  it('stops at max and disables the field', async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={['one']} max={2} />)

    await user.type(field(), 'two{Enter}')

    expect(screen.getByText('two')).toBeInTheDocument()
    expect(field()).toBeDisabled()
  })

  it('rejects a tag the validator turns down', async () => {
    const user = userEvent.setup()
    const onInvalid = vi.fn()
    render(<TagInput validate={(tag) => tag.length >= 3} onInvalid={onInvalid} />)

    await user.type(field(), 'ab{Enter}')

    expect(onInvalid).toHaveBeenCalledWith('ab')
    expect(screen.queryByText('ab')).not.toBeInTheDocument()
  })

  it('commits a pending draft when the field loses focus', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    await user.type(field(), 'design')
    await user.tab()

    expect(screen.getByText('design')).toBeInTheDocument()
  })

  it('passes the invalid state down to the field', () => {
    render(<TagInput invalid aria-describedby="tags-hint" />)

    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveAttribute('aria-describedby', 'tags-hint')
  })

  it('does not commit while an IME is composing', () => {
    const onValueChange = vi.fn()
    render(<TagInput onValueChange={onValueChange} />)

    // Enter is also how an IME picks a candidate; committing there would both
    // swallow the character and add a half-typed tag.
    fireEvent.change(field(), { target: { value: 'design' } })
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('takes an initial value', () => {
    render(<TagInput defaultValue={['beta', 'internal']} />)

    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(screen.getByText('internal')).toBeInTheDocument()
  })
})
