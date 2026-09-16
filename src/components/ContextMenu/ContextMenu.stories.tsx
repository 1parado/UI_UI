import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu'
import { CopyIcon, PencilIcon, RefreshIcon, TrashIcon } from '@/lib/icons'

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ContextMenu>

export const MessageActions: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-[26rem] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click this message
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          <CopyIcon />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <RefreshIcon />
          Regenerate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive focus:text-destructive">
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-[26rem] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click for more
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          <PencilIcon />
          Rename
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move to project</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>UI_UI</ContextMenuItem>
            <ContextMenuItem>FreeAgent</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>New project…</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>Pin to sidebar</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

const ColumnTogglesExample = () => {
  const [columns, setColumns] = React.useState<string[]>(['status'])
  const [density, setDensity] = React.useState('comfortable')

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-[26rem] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click the table header
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel inset>Columns</ContextMenuLabel>
        <ContextMenuSeparator />
        {[
          { id: 'status', label: 'Status' },
          { id: 'model', label: 'Model' },
          { id: 'tokens', label: 'Tokens' },
        ].map((column) => (
          <ContextMenuCheckboxItem
            key={column.id}
            checked={columns.includes(column.id)}
            onCheckedChange={(checked) =>
              setColumns((prev) =>
                checked
                  ? [...prev, column.id]
                  : prev.filter((id) => id !== column.id)
              )
            }
          >
            {column.label}
          </ContextMenuCheckboxItem>
        ))}
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Row density</ContextMenuLabel>
        <ContextMenuRadioGroup value={density} onValueChange={setDensity}>
          <ContextMenuRadioItem value="compact">Compact</ContextMenuRadioItem>
          <ContextMenuRadioItem value="comfortable">
            Comfortable
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/** Checkbox and radio items behave like a small form — state stays with you. */
export const CheckboxAndRadio: Story = {
  render: () => <ColumnTogglesExample />,
}
