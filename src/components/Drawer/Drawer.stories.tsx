import type { Meta, StoryObj } from '@storybook/react'
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

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Drawer>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the result list. Drag the handle down to dismiss.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2 text-sm text-muted-foreground">
          <p>Status · any</p>
          <p>Owner · anyone</p>
          <p>Updated · last 30 days</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/** Actions pinned to the bottom, out of the scrolling area. */
export const WithFooterActions: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Move to project</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move to project</DrawerTitle>
          <DrawerDescription>The item keeps its history and comments.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 text-sm text-muted-foreground">
          <p>Design system</p>
          <p>Marketing site</p>
          <p>Internal tools</p>
        </div>
        <DrawerFooter>
          <Button>Move</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/** Long content scrolls inside the sheet; the grab handle stays put. */
export const ScrollableContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open activity</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Activity</DrawerTitle>
          <DrawerDescription>Everything that happened in this workspace.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 text-sm">
          {Array.from({ length: 30 }).map((_, index) => (
            <p key={index} className="border-b border-border py-2 text-muted-foreground">
              Entry {index + 1} — edited the component tokens.
            </p>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

/** The layout supplies its own dismiss affordance instead of the built-in X. */
export const WithoutBuiltInClose: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open</Button>
      </DrawerTrigger>
      <DrawerContent hideClose>
        <DrawerHeader>
          <DrawerTitle>Quick actions</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

/** `dismissible={false}` for a step the user has to answer. */
export const NotDismissible: Story = {
  render: () => (
    <Drawer dismissible={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Confirm billing</Button>
      </DrawerTrigger>
      <DrawerContent hideClose>
        <DrawerHeader>
          <DrawerTitle>Confirm billing</DrawerTitle>
          <DrawerDescription>
            Dragging and tapping outside are disabled until you choose.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Accept</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
