import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog'

const renderDialog = () =>
  render(
    <AlertDialog>
      <AlertDialogTrigger>Clear conversation</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction>Clear</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

describe('AlertDialog', () => {
  it('opens from the trigger and is labelled by its title', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Clear conversation' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Clear this conversation?' })
    ).toBeInTheDocument()
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
  })

  it('puts focus on Cancel, not the confirm action', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Clear conversation' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Keep it' })).toHaveFocus()
    )
  })

  it('treats Escape as cancel so a keyboard user is never trapped', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await screen.findByRole('alertdialog')

    await user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    )
  })

  it('closes when Cancel is chosen', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Clear conversation' }))
    await user.click(await screen.findByRole('button', { name: 'Keep it' }))

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    )
  })
})
