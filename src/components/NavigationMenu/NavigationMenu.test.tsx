import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './NavigationMenu'

const renderMenu = () =>
  render(
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              <li>
                <NavigationMenuLink href="#alert">Alert</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#dialog">Dialog</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )

describe('NavigationMenu', () => {
  it('renders as a labelled navigation landmark', () => {
    renderMenu()

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Components/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '#docs')
  })

  it('starts collapsed', () => {
    renderMenu()

    expect(screen.getByRole('button', { name: /Components/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('opens the panel on click and links inside stay reachable', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /Components/ }))

    expect(screen.getByRole('button', { name: /Components/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await expect(screen.findByRole('link', { name: 'Alert' })).resolves.toHaveAttribute(
      'href',
      '#alert'
    )
  })

  it('collapses on Escape', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: /Components/ }))
    expect(screen.getByRole('button', { name: /Components/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    )

    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: /Components/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('hides the decorative chevron from assistive tech', () => {
    renderMenu()

    const chevron = screen.getByRole('button', { name: /Components/ }).querySelector('svg')
    expect(chevron).toHaveAttribute('aria-hidden', 'true')
  })
})
