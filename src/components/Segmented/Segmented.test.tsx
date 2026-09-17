import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Segmented, SegmentedItem } from './Segmented'

const options = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar', disabled: true },
]

const radio = (name: string) => screen.getByRole('radio', { name })

describe('Segmented', () => {
  it('is a radio group, not a toolbar of toggles', () => {
    render(<Segmented options={options} defaultValue="list" />)

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(radio('List')).toHaveAttribute('aria-checked', 'true')
    expect(radio('Board')).toHaveAttribute('aria-checked', 'false')
  })

  it('keeps one tab stop on the selection', () => {
    render(<Segmented options={options} defaultValue="board" />)

    expect(radio('Board')).toHaveAttribute('tabindex', '0')
    expect(radio('List')).toHaveAttribute('tabindex', '-1')
  })

  it('selects on click and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Segmented options={options} defaultValue="list" onValueChange={onValueChange} />)

    await user.click(radio('Board'))

    expect(onValueChange).toHaveBeenCalledWith('board')
    expect(radio('Board')).toHaveAttribute('aria-checked', 'true')
  })

  it('moves with the arrow keys and follows with focus', async () => {
    const user = userEvent.setup()
    render(<Segmented options={options} defaultValue="list" />)

    radio('List').focus()
    await user.keyboard('{ArrowRight}')

    expect(radio('Board')).toHaveAttribute('aria-checked', 'true')
    expect(radio('Board')).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(radio('List')).toHaveAttribute('aria-checked', 'true')
  })

  it('skips a disabled option when moving', async () => {
    const user = userEvent.setup()
    render(<Segmented options={options} defaultValue="board" />)

    radio('Board').focus()
    await user.keyboard('{ArrowRight}')

    // "calendar" is disabled, so the next stop wraps to "list".
    expect(radio('List')).toHaveAttribute('aria-checked', 'true')
  })

  it('disables every option when the group is disabled', () => {
    render(<Segmented options={options} defaultValue="list" disabled />)

    expect(radio('List')).toBeDisabled()
    expect(radio('Board')).toBeDisabled()
  })

  it('lets the caller own the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Segmented options={options} value="list" onValueChange={onValueChange} />)

    await user.click(radio('Board'))

    // Controlled: the caller decides, so the DOM keeps the old selection.
    expect(radio('List')).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).toHaveBeenCalledWith('board')
  })

  it('names the group when asked', () => {
    render(<Segmented options={options} defaultValue="list" labels={{ group: 'View' }} />)

    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
  })

  it('accepts composed children for rows that need their own markup', () => {
    render(
      <Segmented defaultValue="a" aria-label="Composed">
        <SegmentedItem value="a" selected>
          One
        </SegmentedItem>
      </Segmented>
    )

    expect(screen.getByRole('radio', { name: 'One' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })
})
