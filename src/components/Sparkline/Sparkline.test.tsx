import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sparkline } from './Sparkline'

const points = (container: HTMLElement) =>
  container.querySelector('polyline')?.getAttribute('points')?.split(' ').filter(Boolean) ?? []

const yAt = (container: HTMLElement, index: number) =>
  Number(points(container)[index].split(',')[1])

describe('Sparkline', () => {
  it('draws one point per value', () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 4]} />)

    expect(points(container)).toHaveLength(4)
  })

  it('stays decorative without a label', () => {
    const { container } = render(<Sparkline data={[1, 2]} />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('exposes itself as an image once it has a label', () => {
    render(<Sparkline data={[1, 2]} label="Requests over seven days" />)

    expect(
      screen.getByRole('img', { name: 'Requests over seven days' })
    ).toBeInTheDocument()
  })

  it('fills the area underneath when asked', () => {
    const { container } = render(<Sparkline data={[1, 3, 2]} area />)

    expect(container.querySelector('polygon')).toBeInTheDocument()
  })

  it('leaves the area out by default', () => {
    const { container } = render(<Sparkline data={[1, 3, 2]} />)

    expect(container.querySelector('polygon')).not.toBeInTheDocument()
  })

  it('draws a single value as a flat rule', () => {
    const { container } = render(<Sparkline data={[7]} />)

    const drawn = points(container)
    expect(drawn).toHaveLength(2)
    expect(drawn[0].split(',')[1]).toBe(drawn[1].split(',')[1])
  })

  it('puts a flat series on the middle line', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} height={32} />)

    // Padding is 2, so the centre of a 32-high box is 16 — a flat series should
    // not sit on the floor pretending to be zero.
    expect(yAt(container, 0)).toBe(16)
  })

  it('honours a pinned scale instead of normalising to the data', () => {
    const auto = render(<Sparkline data={[40, 60]} />)
    const pinned = render(<Sparkline data={[40, 60]} min={0} max={100} />)

    // 40 is the minimum of its own range, so it lands on the baseline; against
    // a fixed 0–100 scale it is 40% up the box instead.
    expect(yAt(auto.container, 0)).toBe(30)
    expect(yAt(pinned.container, 0)).toBeLessThan(30)
  })

  it('adds a rule at the final value', () => {
    const { container } = render(<Sparkline data={[1, 5, 3]} showLastLine />)

    expect(container.querySelector('line')).toBeInTheDocument()
  })

  it('has nothing to draw for empty data', () => {
    const { container } = render(<Sparkline data={[]} />)

    expect(points(container)).toHaveLength(0)
  })
})
