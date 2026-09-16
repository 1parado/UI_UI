import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import { Switch } from '@/components/Switch'
import { Separator } from '@/components/Separator'

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Sheet>

const SettingsBody = () => {
  const [streaming, setStreaming] = React.useState(true)
  const [telemetry, setTelemetry] = React.useState(false)

  return (
    <>
      <SheetHeader>
        <SheetTitle>Workspace settings</SheetTitle>
        <SheetDescription>
          Applies to everyone in this workspace, immediately.
        </SheetDescription>
      </SheetHeader>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sheet-name">Workspace name</Label>
          <Input id="sheet-name" defaultValue="Paradox Labs" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="sheet-stream">Stream responses</Label>
            <span className="text-sm text-muted-foreground">
              Tokens appear as they are generated.
            </span>
          </div>
          <Switch
            id="sheet-stream"
            checked={streaming}
            onCheckedChange={setStreaming}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="sheet-telemetry">Usage telemetry</Label>
            <span className="text-sm text-muted-foreground">
              Share anonymous latency data.
            </span>
          </div>
          <Switch
            id="sheet-telemetry"
            checked={telemetry}
            onCheckedChange={setTelemetry}
          />
        </div>
      </div>

      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Cancel</Button>
        </SheetClose>
        <Button>Save changes</Button>
      </SheetFooter>
    </>
  )
}

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SettingsBody />
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow the run list down to what matters.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked /> Show failed runs only
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Include archived
          </label>
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Attach files</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Add attachments</SheetTitle>
          <SheetDescription>
            Up to 10 files, 20 MB each. Text files are indexed for search.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Show announcement</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Scheduled maintenance</SheetTitle>
          <SheetDescription>
            Sunday 02:00–03:00 UTC. Streaming will be paused, history stays
            readable.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}
