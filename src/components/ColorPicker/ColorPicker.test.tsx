import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker, ColorSwatch } from './ColorPicker'

const trigger = () => screen.getByRole('button', { name: 'Color' })
const hexField = () => screen.getByLabelText('Color hex value')

describe('ColorPicker', () => {
  it('shows the value on the trigger', () => {
    render(<ColorPicker defaultValue="#2563eb" />)

    expect(trigger()).toHaveTextContent('#2563eb')
  })

  it('falls back to black', () => {
    render(<ColorPicker />)

    expect(trigger()).toHaveTextContent('#000000')
  })

  it('opens a panel with a hue slider', async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#2563eb" />)

    await user.click(trigger())

    const hue = await screen.findByRole('slider', { name: 'Hue' })
    expect(hue).toHaveAttribute('aria-valuenow', '221')
  })

  it('commits a typed hex', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue="#000000" onValueChange={onValueChange} />)

    await user.click(trigger())
    await user.clear(hexField())
    await user.type(hexField(), '#ff8800')

    expect(onValueChange).toHaveBeenLastCalledWith('#ff8800')
    expect(trigger()).toHaveTextContent('#ff8800')
  })

  it('leaves a half-typed hex alone', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue="#000000" onValueChange={onValueChange} />)

    await user.click(trigger())
    await user.clear(hexField())
    await user.type(hexField(), '#ff8')

    // '#ff8' is a valid shorthand; '#ff88' is not, and must not commit.
    expect(onValueChange).toHaveBeenLastCalledWith('#ffff88')
    expect(onValueChange).not.toHaveBeenCalledWith('#ff8800')
  })

  it('picks a preset', async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#000000" presets={['#dc2626', '#16a34a']} />)

    await user.click(trigger())
    await user.click(screen.getByRole('button', { name: '#16a34a' }))

    expect(trigger()).toHaveTextContent('#16a34a')
  })

  it('marks the active preset', async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#dc2626" presets={['#dc2626', '#16a34a']} />)

    await user.click(trigger())

    expect(screen.getByRole('button', { name: '#dc2626' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '#16a34a' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('steps the hue with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#ff0000" />)

    await user.click(trigger())
    const hue = await screen.findByRole('slider', { name: 'Hue' })
    hue.focus()
    await user.keyboard('{ArrowRight}')

    expect(hue).toHaveAttribute('aria-valuenow', '1')
  })

  it('steps ten degrees at a time with shift held', async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue="#ff0000" />)

    await user.click(trigger())
    const hue = await screen.findByRole('slider', { name: 'Hue' })
    hue.focus()
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')

    // A step back from red wraps to the other end of the wheel.
    expect(hue).toHaveAttribute('aria-valuenow', '350')
  })

  it('renders a native colour field when asked', () => {
    render(<ColorPicker defaultValue="#db2777" native />)

    expect(screen.getByLabelText('Color')).toHaveValue('#db2777')
  })

  it('does not open a disabled picker', () => {
    render(<ColorPicker defaultValue="#000000" disabled />)

    expect(trigger()).toBeDisabled()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('submits with the surrounding form', () => {
    const { container } = render(<ColorPicker defaultValue="#2563eb" name="brand" />)

    expect(container.querySelector('input[name="brand"]')).toHaveValue('#2563eb')
  })
})

describe('ColorSwatch', () => {
  it('paints the given colour and stays out of the a11y tree', () => {
    render(<ColorSwatch color="#16a34a" data-testid="chip" />)

    const chip = screen.getByTestId('chip')
    expect(chip).toHaveAttribute('aria-hidden', 'true')
    // jsdom normalises the hex through cssstyle, so compare the resolved value.
    expect(chip.style.backgroundColor).toBe('rgb(22, 163, 74)')
  })
})
