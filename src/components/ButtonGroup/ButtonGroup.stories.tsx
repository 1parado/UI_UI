import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup, ButtonGroupSeparator } from './ButtonGroup'
import { Button } from '@/components/Button'
import { CheckIcon, CopyIcon, ChevronDownIcon } from '@/lib/icons'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
}

/** Same group with one member marked as the current choice. */
export const ActiveChoice: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline" aria-pressed="true" className="bg-accent">
        Week
      </Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Move up</Button>
      <Button variant="outline">Move down</Button>
      <Button variant="outline">Duplicate</Button>
    </ButtonGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Cut
        </Button>
        <Button variant="outline" size="sm">
          Copy
        </Button>
        <Button variant="outline" size="sm">
          Paste
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Cut</Button>
        <Button variant="outline">Copy</Button>
        <Button variant="outline">Paste</Button>
      </ButtonGroup>
    </div>
  ),
}

/** Attached actions: one primary action, one menu disclosure. */
export const SplitAction: Story = {
  render: () => (
    <ButtonGroup>
      <Button>
        <CheckIcon className="h-4 w-4" />
        Approve
      </Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More approve options">
        <ChevronDownIcon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  ),
}

export const MixedIntents: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <CopyIcon className="h-4 w-4" />
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button variant="destructive">Delete</Button>
    </ButtonGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" disabled>
        Undo
      </Button>
      <Button variant="outline" disabled>
        Redo
      </Button>
    </ButtonGroup>
  ),
}
