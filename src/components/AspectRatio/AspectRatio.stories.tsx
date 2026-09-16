import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from './AspectRatio'

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AspectRatio>

const Swatch = ({ label }: { label: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
    {label}
  </div>
)

export const Default: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args} className="overflow-hidden rounded-md border">
        <Swatch label="16 / 9" />
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  args: { ratio: 1 },
  render: (args) => (
    <div className="w-40">
      <AspectRatio {...args} className="overflow-hidden rounded-md border">
        <Swatch label="1 / 1" />
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  args: { ratio: 3 / 4 },
  render: (args) => (
    <div className="w-40">
      <AspectRatio {...args} className="overflow-hidden rounded-md border">
        <Swatch label="3 / 4" />
      </AspectRatio>
    </div>
  ),
}

/** A cover image is the common case: the box holds the space before the file loads. */
export const MediaSlot: Story = {
  render: () => (
    <div className="w-96">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border">
        <div className="flex h-full w-full flex-col justify-end bg-muted p-4">
          <p className="text-sm font-medium">Quarterly review</p>
          <p className="text-xs text-muted-foreground">Placeholder for the poster frame</p>
        </div>
      </AspectRatio>
    </div>
  ),
}
