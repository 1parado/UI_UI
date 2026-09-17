import type { Meta, StoryObj } from '@storybook/react'
import { Image } from './Image'
import { Skeleton } from '@/components/Skeleton'

const shot = (id: number, width = 1200) =>
  `https://picsum.photos/id/${id}/${width}/${Math.round(width * 0.75)}`

const meta = {
  title: 'Components/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An `<img>` that knows what pictures are for: defer anything below the fold, hold its layout while loading, fail into something graceful, and open a zoomable preview on click. Everything else passes straight through to the element, so `srcSet`, `sizes` and `width`/`height` behave exactly as they would on their own.',
      },
    },
  },
  args: {
    src: shot(1015),
    alt: 'A river between mountains',
    width: 400,
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPreview: Story = {
  args: {
    preview: true,
    previewSrc: shot(1015, 2400),
  },
}

export const FillingASpace: Story = {
  render: (args) => (
    <div className="grid h-72 grid-cols-3 gap-4">
      <Image {...args} fill fit="cover" width={undefined} />
      <Image {...args} fill fit="contain" width={undefined} />
      <Image {...args} fill fit="scale-down" width={undefined} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`fill` needs a sized parent; the three boxes below are 18rem tall grid cells.',
      },
    },
  },
}

export const EagerHero: Story = {
  args: { lazy: false, width: 640 },
  parameters: {
    docs: {
      description: {
        story: 'Pictures above the fold should not be deferred — deferring makes the page look slower.',
      },
    },
  },
}

export const PlaceholderWhileLoading: Story = {
  args: {
    width: 400,
    placeholder: <Skeleton className="h-48 w-full" />,
  },
}

export const BrokenLink: Story = {
  args: { src: '/does-not-exist.png' },
}

export const CustomFallback: Story = {
  args: {
    src: '/does-not-exist.png',
    fallback: <span className="text-sm text-destructive">The file moved.</span>,
  },
}
