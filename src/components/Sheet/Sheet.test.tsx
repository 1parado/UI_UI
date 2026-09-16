import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet'

const renderSheet = () =>
  render(
    <Sheet>
      <SheetTrigger>Open settings</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>Applies immediately.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )

describe('Sheet', () => {
  it('opens from the trigger with a dialog role and label', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: 'Open settings' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Workspace settings')
    expect(dialog).toHaveAccessibleDescription('Applies immediately.')
  })

  it('renders a labelled close button unless it is suppressed', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSheet()

    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument()

    rerender(
      <Sheet defaultOpen>
        <SheetContent hideClose>
          <SheetTitle>Workspace settings</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Close' })
      ).not.toBeInTheDocument()
    )
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.click(screen.getByRole('button', { name: 'Open settings' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('is locked to the side it was given', async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger>Open filters</SheetTrigger>
        <SheetContent side="left" data-testid="panel">
          <SheetTitle>Filters</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    const panel = await screen.findByTestId('panel')

    expect(panel.className).toContain('left-0')
    expect(panel.className).toContain('inset-y-0')
  })
})
