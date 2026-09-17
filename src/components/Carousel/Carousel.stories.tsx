import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './Carousel'

const meta = {
  title: 'Components/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A scroll-snap carousel driven by embla — native overflow, so touch and trackpad momentum behave the way the platform does. The layer here is the ARIA wiring, the keyboard handling and arrows that disable themselves at the ends.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Slide = ({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'card' }) => (
  <div
    className={
      tone === 'card'
        ? 'flex h-40 items-center justify-center rounded-lg border border-border bg-card text-sm'
        : 'flex h-40 items-center justify-center rounded-lg bg-muted text-sm'
    }
  >
    {children}
  </div>
)

export const Default: Story = {
  render: () => (
    <Carousel aria-label="Featured projects" className="w-[480px]">
      <CarouselContent>
        {['Atlas', 'Beacon', 'Cinder', 'Delta'].map((name) => (
          <CarouselItem key={name} className="p-1">
            <Slide tone="card">{name}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/** `basis-1/2` shows two at a time; the items stay in one scroll track. */
export const MultiplePerView: Story = {
  render: () => (
    <Carousel aria-label="Screenshots" className="w-[560px]">
      <CarouselContent>
        {Array.from({ length: 8 }, (_, index) => (
          <CarouselItem key={index} className="basis-1/2 p-1">
            <Slide tone="card">Screenshot {index + 1}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Carousel aria-label="Timeline" orientation="vertical" className="w-[320px]">
      <CarouselContent className="h-64">
        {['09:00 Standup', '11:00 Review', '14:00 Pairing', '16:00 Retro'].map((entry) => (
          <CarouselItem key={entry} className="p-1">
            <div className="flex h-20 items-center justify-center rounded-lg bg-muted text-sm">
              {entry}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/** `opts` goes straight to embla — here, wrap around at both ends. */
export const Looping: Story = {
  render: () => (
    <Carousel aria-label="Looping" className="w-[480px]" opts={{ loop: true }}>
      <CarouselContent>
        {['One', 'Two', 'Three'].map((name) => (
          <CarouselItem key={name} className="p-1">
            <Slide tone="card">{name}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

const Dots = () => {
  // embla's api is the escape hatch for anything the wrapper does not expose.
  const [selected, setSelected] = React.useState(0)

  return (
    <Carousel
      aria-label="With dots"
      className="w-[480px]"
      setApi={(api) => {
        if (!api) return
        const update = () => setSelected(api.selectedScrollSnap())
        api.on('select', update)
        update()
      }}
    >
      <CarouselContent>
        {['Alpha', 'Beta', 'Gamma'].map((name) => (
          <CarouselItem key={name} className="p-1">
            <Slide tone="card">{name}</Slide>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <p className="mt-2 text-center text-xs text-muted-foreground">Slide {selected + 1} of 3</p>
    </Carousel>
  )
}

/** `setApi` gives you the embla instance for things like a dot indicator. */
export const WithApi: Story = {
  render: () => <Dots />,
}
