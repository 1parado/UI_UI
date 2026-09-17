import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './Carousel'

const Demo = () => (
  <Carousel aria-label="Featured projects" className="w-[400px]">
    <CarouselContent>
      <CarouselItem>One</CarouselItem>
      <CarouselItem>Two</CarouselItem>
      <CarouselItem>Three</CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
)

describe('Carousel', () => {
  it('announces itself as a carousel region', () => {
    render(<Demo />)

    const region = screen.getByRole('region', { name: 'Featured projects' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
  })

  it('marks each item as a slide', () => {
    render(<Demo />)

    const slides = screen.getAllByRole('group')
    expect(slides).toHaveLength(3)
    expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide')
  })

  it('renders accessible arrow buttons', () => {
    render(<Demo />)

    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
  })

  it('takes label overrides', () => {
    render(
      <Carousel aria-label="图集" labels={{ next: '下一张', previous: '上一张' }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )

    expect(screen.getByRole('button', { name: '下一张' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一张' })).toBeInTheDocument()
  })

  it('disables the arrows when there is nowhere to scroll', () => {
    render(<Demo />)

    // jsdom has no layout, so embla reports a single snap point and both
    // directions are exhausted. The buttons have to say so rather than looking
    // clickable and doing nothing.
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
  })

  it('handles an arrow key without throwing', async () => {
    const user = userEvent.setup()

    render(<Demo />)
    await user.click(screen.getByRole('region', { name: 'Featured projects' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('region', { name: 'Featured projects' })).toBeInTheDocument()
  })

  it('can be watched from outside through setApi', () => {
    const setApi = vi.fn()

    render(
      <Carousel aria-label="Watched" setApi={setApi}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>
    )

    expect(setApi).toHaveBeenCalled()
    expect(setApi.mock.calls[0][0]).toBeTruthy()
  })

  it('renders vertical slides in a column', () => {
    const { container } = render(
      <Carousel aria-label="Vertical" orientation="vertical">
        <CarouselContent data-testid="track">
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>
    )

    expect(container.querySelector('[data-testid="track"]')).toHaveClass('flex-col')
  })
})
