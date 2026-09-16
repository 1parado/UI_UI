import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command'
import { Button } from '@/components/Button'
import { Kbd } from '@/components/Kbd'

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Command>

export const Inline: Story = {
  render: () => (
    <Command className="w-[28rem] rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Conversations">
          <CommandItem onSelect={() => undefined}>
            Why does retry keep returning 401?
          </CommandItem>
          <CommandItem onSelect={() => undefined}>
            Token accounting across cached prompts
          </CommandItem>
          <CommandItem onSelect={() => undefined}>
            Migrating off react-day-picker v8
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => undefined}>
            New chat
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => undefined}>
            Export conversation
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem disabled onSelect={() => undefined}>
            Delete workspace
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

const PaletteExample = () => {
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open palette
      </Button>
      <p className="text-sm text-muted-foreground">
        {picked ? `Last command: ${picked}` : `Shortcut: ⌘K`}
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                setPicked('Open API keys')
                setOpen(false)
              }}
            >
              Open API keys
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setPicked('Change model')
                setOpen(false)
              }}
            >
              Change model
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setPicked('Toggle theme')
                setOpen(false)
              }}
            >
              Toggle theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

/** The ⌘K surface. Selection closes the dialog for you in real usage. */
export const Dialog: Story = { render: () => <PaletteExample /> }

export const Loading: Story = {
  render: () => (
    <Command className="w-[28rem] rounded-lg border shadow-md">
      <CommandInput placeholder="Search models…" />
      <CommandList>
        <CommandGroup heading="Models">
          <CommandItem>gpt-5</CommandItem>
          <CommandItem>claude-sonnet-4.5</CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center gap-2 border-t px-3 py-2 text-sm text-muted-foreground">
        <Kbd>Esc</Kbd>
        <span>close</span>
      </div>
    </Command>
  ),
}
