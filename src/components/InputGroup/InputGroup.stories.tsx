import type { Meta, StoryObj } from '@storybook/react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from './InputGroup'
import { Button } from '@/components/Button'
import { Kbd } from '@/components/Kbd'
import { SearchIcon } from '@/lib/icons'

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InputGroup>

export const WithIcon: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search conversations…" />
    </InputGroup>
  ),
}

export const WithShortcut: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search or jump to…" />
      <InputGroupAddon align="inline-end">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupText>https://</InputGroupText>
      <InputGroupInput placeholder="example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.dev</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithAction: Story = {
  render: () => (
    <InputGroup className="w-96">
      <InputGroupInput placeholder="name@company.com" type="email" />
      <InputGroupAddon align="inline-end">
        <Button size="sm" className="h-7">
          Invite
        </Button>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <InputGroup className="border-destructive focus-within:ring-destructive">
        <InputGroupInput
          defaultValue="not-an-email"
          aria-invalid
          aria-describedby="group-error"
        />
      </InputGroup>
      <p id="group-error" className="text-sm text-destructive">
        Enter a valid email address.
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput defaultValue="locked" disabled />
    </InputGroup>
  ),
}
