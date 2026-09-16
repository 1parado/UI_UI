import type { Meta, StoryObj } from '@storybook/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './NavigationMenu'
import { cn } from '@/lib/utils'

const meta: Meta<typeof NavigationMenu> = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof NavigationMenu>

const components = [
  { title: 'Alert', href: '#alert', body: 'Call out a result that needs attention.' },
  { title: 'Dialog', href: '#dialog', body: 'Interrupt the flow for a decision that matters.' },
  { title: 'Popover', href: '#popover', body: 'Keep secondary controls next to their trigger.' },
  { title: 'Tabs', href: '#tabs', body: 'Swap between sibling views in place.' },
]

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[320px] gap-1 p-1">
              {components.slice(0, 3).map((component) => (
                <li key={component.title}>
                  <NavigationMenuLink href={component.href} className="block p-3">
                    <div className="text-sm font-medium">{component.title}</div>
                    <p className="text-sm text-muted-foreground">{component.body}</p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs" className={cn(navigationMenuTriggerStyle())}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#changelog" className={cn(navigationMenuTriggerStyle())}>
            Changelog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

/**
 * Several anchors feeding one shared viewport. Because the viewport animates
 * between sizes, the panel below swaps instead of jumping.
 */
export const Megamenu: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] grid-cols-2 gap-1 p-1">
              {components.map((component) => (
                <li key={component.title}>
                  <NavigationMenuLink href={component.href} className="block p-3">
                    <div className="text-sm font-medium">{component.title}</div>
                    <p className="text-sm text-muted-foreground">{component.body}</p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[220px] gap-1 p-1">
              <li>
                <NavigationMenuLink href="#tokens" className="block p-3 text-sm font-medium">
                  Design tokens
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#icons" className="block p-3 text-sm font-medium">
                  Icon set
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

/** A single-level menu — no panel, just links — still gets the trigger treatment. */
export const LinksOnly: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        {['Overview', 'Pricing', 'About'].map((label) => (
          <NavigationMenuItem key={label}>
            <NavigationMenuLink href={`#${label.toLowerCase()}`} className={cn(navigationMenuTriggerStyle())}>
              {label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
