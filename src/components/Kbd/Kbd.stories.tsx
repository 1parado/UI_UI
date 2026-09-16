import type { Meta, StoryObj } from '@storybook/react'
import { Kbd, KbdGroup } from './Kbd'

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  render: () => <Kbd>Esc</Kbd>,
}

/** One key per `Kbd` — an array inside a single node reads as a typo. */
export const Combos: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-8">
        <span>Open command palette</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span>Send message</span>
        <Kbd>Enter</Kbd>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span>New line in composer</span>
        <KbdGroup>
          <Kbd>Shift</Kbd>
          <Kbd>Enter</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span>Clear conversation</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌫</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
}

export const Inline: Story = {
  render: () => (
    <p className="max-w-md text-sm text-muted-foreground">
      Press <Kbd>Enter</Kbd> to send, or <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for
      a new line. Escape closes the palette.
    </p>
  ),
}
