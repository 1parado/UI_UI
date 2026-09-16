import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './Menubar'

const renderMenubar = (ui?: React.ReactNode) =>
  render(
    ui ?? (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Open recent</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  )

/** `checked` is a controlled prop, so multi-select needs the owner to hold state. */
function ViewMenuHarness() {
  const [panels, setPanels] = React.useState<string[]>(['sidebar'])
  const toggle = (panel: string) => (checked: boolean | 'indeterminate') =>
    setPanels((current) =>
      checked === true
        ? [...current, panel]
        : current.filter((entry) => entry !== panel)
    )

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem
            checked={panels.includes('sidebar')}
            onCheckedChange={toggle('sidebar')}
          >
            Sidebar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={panels.includes('status-bar')}
            onCheckedChange={toggle('status-bar')}
          >
            Status bar
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

describe('Menubar', () => {
  it('renders one trigger per menu inside a menubar landmark', () => {
    renderMenubar()

    const bar = screen.getByRole('menubar')
    expect(within(bar).getAllByRole('menuitem')).toHaveLength(2)
    expect(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  it('opens a menu from its trigger and lists the items', async () => {
    const user = userEvent.setup()
    renderMenubar()

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'File' }))

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /New tab/ })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'Open recent' })).toBeInTheDocument()
  })

  it('keeps a single menu open while moving across the bar', async () => {
    const user = userEvent.setup()
    renderMenubar()

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute('data-state', 'open')

    // Once a menu is open, hovering a sibling trigger walks the bar — the
    // behaviour every native menu bar has, and the reason `MenubarTrigger`
    // listens on pointerenter rather than click.
    await user.hover(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('data-state', 'open')
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute('data-state', 'closed')

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Undo' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Open recent' })).not.toBeInTheDocument()
  })

  it('opens the first menu with ArrowDown from the bar', async () => {
    const user = userEvent.setup()
    renderMenubar()

    await user.tab()
    await user.keyboard('{ArrowDown}')

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: /New tab/ })).toBeInTheDocument()
  })

  it('toggles independent checkbox items, closing the menu after each pick', async () => {
    const user = userEvent.setup()
    render(<ViewMenuHarness />)

    const openViewMenu = async () => {
      await user.click(screen.getByRole('menuitem', { name: 'View' }))
      return screen.findByRole('menu')
    }
    const item = (name: string) => screen.getByRole('menuitemcheckbox', { name })

    await openViewMenu()
    expect(item('Sidebar')).toHaveAttribute('aria-checked', 'true')
    expect(item('Status bar')).toHaveAttribute('aria-checked', 'false')

    await user.click(item('Status bar'))

    // Selecting an item closes the menu — the a11y tree loses it and the DOM
    // node unmounts — so the effect is read back by reopening.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await openViewMenu()
    expect(item('Status bar')).toHaveAttribute('aria-checked', 'true')
    expect(item('Sidebar')).toHaveAttribute('aria-checked', 'true')

    await user.click(item('Sidebar'))
    await openViewMenu()

    // Independent: turning one off leaves the other alone.
    expect(item('Sidebar')).toHaveAttribute('aria-checked', 'false')
    expect(item('Status bar')).toHaveAttribute('aria-checked', 'true')
  })

  it('makes an exclusive choice with radio items', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderMenubar(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Theme</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="light" onValueChange={onValueChange}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    await user.click(screen.getByRole('menuitem', { name: 'Theme' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Dark' }))

    expect(onValueChange).toHaveBeenCalledWith('dark')
  })

  it('reveals a nested submenu', async () => {
    const user = userEvent.setup()
    renderMenubar(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New tab</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Copy link</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Share' }))

    expect(await screen.findByRole('menuitem', { name: 'Copy link' })).toBeInTheDocument()
  })

  it('does not invoke a disabled item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderMenubar(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled onSelect={onSelect}>
              Cut
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cut' }))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
