import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup'

describe('ToggleGroup', () => {
  it('keeps a single selection and reports every change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ToggleGroup
        type="single"
        defaultValue="center"
        onValueChange={onValueChange}
        aria-label="Alignment"
      >
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
      </ToggleGroup>
    )

    expect(screen.getByRole('radio', { name: 'Center' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Left' }))

    expect(onValueChange).toHaveBeenCalledWith('left')
    expect(screen.getByRole('radio', { name: 'Left' })).toBeChecked()
  })

  it('accumulates selections when type is multiple', async () => {
    const user = userEvent.setup()

    render(
      <ToggleGroup type="multiple" aria-label="Formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    )

    await user.click(screen.getByRole('button', { name: 'Bold' }))
    await user.click(screen.getByRole('button', { name: 'Italic' }))

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'data-state',
      'on'
    )
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute(
      'data-state',
      'on'
    )
  })

  it('passes variant and size from the group down to its items', () => {
    render(
      <ToggleGroup type="single" variant="outline" size="sm" aria-label="Range">
        <ToggleGroupItem value="24h">24h</ToggleGroupItem>
      </ToggleGroup>
    )

    const item = screen.getByRole('radio', { name: '24h' })
    expect(item.className).toContain('border-input')
    expect(item.className).toContain('h-9')
  })

  it('lets an item ignore the group disabled state on its own', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ToggleGroup
        type="single"
        onValueChange={onValueChange}
        aria-label="Range"
      >
        <ToggleGroupItem value="a">Alpha</ToggleGroupItem>
        <ToggleGroupItem value="b" disabled>
          Beta
        </ToggleGroupItem>
      </ToggleGroup>
    )

    await user.click(screen.getByRole('radio', { name: 'Beta' }))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
