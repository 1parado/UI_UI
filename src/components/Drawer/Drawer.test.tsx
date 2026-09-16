import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer'
import { Button } from '@/components/Button'

const renderDrawer = () =>
  render(
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the result list.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Apply</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )

describe('Drawer', () => {
  it('opens from its trigger and is labelled by the title', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Open filters' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Filters')
    expect(screen.getByText('Narrow the result list.')).toBeInTheDocument()
  })

  it('closes from a DrawerClose child', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    await user.click(await screen.findByRole('button', { name: 'Apply' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on the built-in close button', async () => {
    const user = userEvent.setup()
    renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hides the built-in close button when the layout provides its own', async () => {
    const user = userEvent.setup()
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open</Button>
        </DrawerTrigger>
        <DrawerContent hideClose>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('works as a controlled dialog', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Drawer open={false} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <Button variant="outline">Open</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )

    await user.click(screen.getByRole('button', { name: 'Open' }))

    // Still closed: the owner decides.
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
