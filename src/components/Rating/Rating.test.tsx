import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Rating } from './Rating'

const star = (value: number) => screen.getByRole('button', { name: `Set rating to ${value}` })
const slider = () => screen.getByRole('slider')

describe('Rating', () => {
  it('draws as many stars as max asks for', () => {
    render(<Rating defaultValue={0} max={7} />)

    expect(screen.getAllByRole('button')).toHaveLength(7)
  })

  it('sets the value on click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating defaultValue={0} onValueChange={onValueChange} />)

    await user.click(star(3))

    expect(onValueChange).toHaveBeenCalledWith(3)
  })

  it('keeps the value itself when uncontrolled', async () => {
    const user = userEvent.setup()
    render(<Rating defaultValue={1} />)

    await user.click(star(4))

    expect(slider()).toHaveAttribute('aria-valuenow', '4')
  })

  it('moves one step per arrow key', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating defaultValue={2} onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(3)

    await user.keyboard('{ArrowLeft}')
    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  it('jumps to either end with Home and End', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating defaultValue={3} onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(5)

    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it('lands on halves when step is 0.5', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating defaultValue={2} step={0.5} onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenLastCalledWith(2.5)
  })

  it('does not run past either end', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating defaultValue={5} onValueChange={onValueChange} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('reports its value through ARIA', () => {
    render(<Rating value={3} />)

    expect(slider()).toHaveAttribute('aria-valuenow', '3')
    expect(slider()).toHaveAttribute('aria-valuemax', '5')
    expect(slider()).toHaveAttribute('aria-valuetext', '3 of 5')
  })

  it('takes itself out of the tab order when read-only', () => {
    render(<Rating value={3} readOnly />)

    expect(slider()).toHaveAttribute('tabindex', '-1')
    expect(slider()).toHaveAttribute('aria-readonly', 'true')
    expect(star(1)).toBeDisabled()
  })

  it('disables the stars when the whole control is disabled', () => {
    render(<Rating value={2} disabled />)

    expect(slider()).toHaveAttribute('aria-disabled', 'true')
    expect(star(5)).toBeDisabled()
  })

  it('marks a half-filled star by clipping a filled one', () => {
    const { container } = render(<Rating value={1.5} step={0.5} />)

    // Each star renders an outline plus, when partly filled, a clipped solid
    // copy sized to the fraction.
    const clipped = container.querySelectorAll('[aria-label="Set rating to 2"] span[style]')
    expect(clipped).toHaveLength(1)
    expect(clipped[0]).toHaveStyle({ width: '50%' })
  })
})
