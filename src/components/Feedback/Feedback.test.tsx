import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Feedback } from './Feedback'

describe('Feedback', () => {
  it('rates up, then clears the rating on a second click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Feedback onValueChange={onValueChange} />)
    const up = screen.getByRole('button', { name: 'Good response' })

    await user.click(up)
    expect(onValueChange).toHaveBeenLastCalledWith('up')
    expect(up).toHaveAttribute('aria-pressed', 'true')

    await user.click(up)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(up).toHaveAttribute('aria-pressed', 'false')
  })

  it('moves the rating between thumbs', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Feedback onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Good response' }))
    await user.click(screen.getByRole('button', { name: 'Bad response' }))

    expect(onValueChange).toHaveBeenLastCalledWith('down')
    expect(screen.getByRole('button', { name: 'Good response' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Bad response' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('stays on the given value when controlled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Feedback value="down" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Good response' }))

    expect(onValueChange).toHaveBeenCalledWith('up')
    expect(screen.getByRole('button', { name: 'Bad response' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('calls onRegenerate', async () => {
    const user = userEvent.setup()
    const onRegenerate = vi.fn()
    render(<Feedback onRegenerate={onRegenerate} />)

    await user.click(screen.getByRole('button', { name: 'Regenerate response' }))

    expect(onRegenerate).toHaveBeenCalledTimes(1)
  })

  it('hides regenerate when no handler is given', () => {
    render(<Feedback />)

    expect(screen.queryByRole('button', { name: 'Regenerate response' })).toBeNull()
  })
})
