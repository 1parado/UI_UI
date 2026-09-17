import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Cropper } from './Cropper'
import type { CropperHandle } from './Cropper'
import { Button } from '@/components/Button'

const shot = (id: number, w = 1600) =>
  `https://picsum.photos/id/${id}/${w}/${Math.round(w * 0.5625)}`

const meta = {
  title: 'Components/Cropper',
  component: Cropper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Crop by moving the picture under a fixed window — the way a phone\'s photo picker works. Dragging one rectangle around another is two problems wearing one coat, and "zoom, then slide what matters into frame" is a gesture people already know. The picture is kept *covering* the window, so there is never a gap to crop into. Export draws the window out of the source image at its natural resolution, so a 4000px photo yields a 4000px-wide crop rather than a screenshot of the preview.',
      },
    },
  },
  args: {
    src: shot(1025),
    height: 320,
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['rect', 'circle'] },
    minZoom: { control: { type: 'number', step: 0.1 } },
  },
} satisfies Meta<typeof Cropper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Avatar: Story = {
  args: { aspect: 1, shape: 'circle', height: 280 },
}

export const WideBanner: Story = {
  args: { aspect: 16 / 9, showGrid: false },
}

function WithTheResultDemo(args: React.ComponentProps<typeof Cropper>) {
  const cropper = React.useRef<CropperHandle>(null)
  const [result, setResult] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Cropper {...args} ref={cropper} aspect={1} />
      </div>
      <div className="flex w-48 flex-col items-center gap-2">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-border">
          {result ? (
            <img src={result} alt="Cropped result" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">Nothing cropped</span>
          )}
        </div>
        <Button size="sm" onClick={() => setResult(cropper.current?.toDataURL() ?? null)}>
          Crop
        </Button>
      </div>
    </div>
  )
}

export const WithTheResult: Story = {
  render: (args) => <WithTheResultDemo {...args} />,
}

export const FineGrainedZoom: Story = {
  args: { minZoom: 1, maxZoom: 6, height: 260 },
}

export const WithoutControls: Story = {
  args: { showControls: false },
}
