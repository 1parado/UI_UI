import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from './Sidebar'

const rail = (container: HTMLElement) => {
  const element = container.querySelector('[data-sidebar="sidebar-root"]')
  if (!element) throw new Error('sidebar root not rendered')
  return element
}

const renderSidebar = (
  providerProps: Partial<React.ComponentProps<typeof SidebarProvider>> = {},
  sidebarProps: Partial<React.ComponentProps<typeof Sidebar>> = {},
  buttonProps: Partial<React.ComponentProps<typeof SidebarMenuButton>> = {}
) =>
  render(
    <SidebarProvider {...providerProps}>
      <Sidebar {...sidebarProps}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive {...buttonProps}>
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  )

const toggle = () => screen.getByRole('button', { name: 'Toggle sidebar' })

afterEach(() => {
  window.localStorage.clear()
})

describe('Sidebar', () => {
  it('renders expanded by default and collapses from the trigger', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebar()

    expect(rail(container)).toHaveAttribute('data-state', 'expanded')
    expect(screen.getByRole('main')).toBeInTheDocument()

    await user.click(toggle())

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed')
  })

  it('toggles from the keyboard shortcut', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebar()

    await user.keyboard('{Control>}b{/Control}')

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed')

    await user.keyboard('{Control>}b{/Control}')

    expect(rail(container)).toHaveAttribute('data-state', 'expanded')
  })

  it('reports the collapse mode only while collapsed', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebar({}, { collapsible: 'icon' })

    expect(rail(container)).toHaveAttribute('data-collapsible', '')

    await user.click(toggle())

    expect(rail(container)).toHaveAttribute('data-collapsible', 'icon')
  })

  it('honours a controlled open prop', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { container } = renderSidebar({ open: false, onOpenChange })

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed')

    await user.click(toggle())

    expect(onOpenChange).toHaveBeenCalledWith(true)
    // Still collapsed: the owner decides.
    expect(rail(container)).toHaveAttribute('data-state', 'collapsed')
  })

  it('remembers the rail state under storageKey', async () => {
    const user = userEvent.setup()
    const first = renderSidebar({ storageKey: 'ui-ui-sidebar' })

    await user.click(toggle())
    expect(window.localStorage.getItem('ui-ui-sidebar')).toBe('false')

    first.unmount()

    // A fresh mount reads the stored value, so a reload keeps the layout.
    const second = renderSidebar({ storageKey: 'ui-ui-sidebar' })
    expect(rail(second.container)).toHaveAttribute('data-state', 'collapsed')
  })

  it('marks the active menu item', () => {
    renderSidebar({}, {}, { isActive: true })

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('data-active', 'true')
  })

  it('surfaces the label as a tooltip once collapsed', async () => {
    const user = userEvent.setup()
    renderSidebar({ open: false }, {}, { tooltip: 'Home' })

    await user.hover(screen.getByRole('button', { name: 'Home' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Home')
  })

  it('throws when useSidebar runs outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Outside = () => {
      useSidebar()
      return null
    }

    expect(() => render(<Outside />)).toThrow(/within a SidebarProvider/)
    spy.mockRestore()
  })
})
