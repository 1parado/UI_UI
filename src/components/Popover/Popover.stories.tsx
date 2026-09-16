import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import { Button } from '../Button'
import { Input } from '../Input'
import { Label } from '../Label'

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="width">Width</Label>
            <Input id="width" defaultValue="100%" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="height">Height</Label>
            <Input id="height" defaultValue="25px" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-2">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="capitalize">
              {align}
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align} className="w-40 text-sm">
            Aligned to <strong>{align}</strong>.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
