import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './Menubar'

const meta: Meta<typeof Menubar> = {
  title: 'Components/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Menubar>

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Share <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Zoom in <MenubarShortcut>⌘+</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Zoom out <MenubarShortcut>⌘-</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Reset zoom</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
}

/**
 * Checkbox items hold independent toggles; radio items make an exclusive
 * choice. Both are controlled — the values below live in story state, which is
 * what makes them toggle.
 */
function TogglesAndChoicesDemo() {
  const [panels, setPanels] = React.useState<string[]>(['sidebar'])
  const [theme, setTheme] = React.useState('system')
  const togglePanel = (panel: string) =>
    setPanels((current) =>
      current.includes(panel) ? current.filter((entry) => entry !== panel) : [...current, panel]
    )

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Panels</MenubarLabel>
          <MenubarCheckboxItem
            checked={panels.includes('sidebar')}
            onCheckedChange={() => togglePanel('sidebar')}
          >
            Sidebar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={panels.includes('outline')}
            onCheckedChange={() => togglePanel('outline')}
          >
            Outline
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Theme</MenubarLabel>
          <MenubarRadioGroup value={theme} onValueChange={setTheme}>
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            <MenubarRadioItem value="system">Match system</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export const TogglesAndChoices: Story = {
  render: () => <TogglesAndChoicesDemo />,
}

/** Submenus nest arbitrarily deep and open on hover after a short delay. */
export const WithSubmenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New tab</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Copy link</MenubarItem>
              <MenubarItem>Email</MenubarItem>
              <MenubarItem>Export as PDF</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Close tab</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
}
