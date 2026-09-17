import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RingProgress } from './RingProgress'

const indicator = (container: HTMLElement) =>
  container.querySelectorAll('circle')[1] ?? null

describe('RingProgress', () => {
  it('exposes the value on a progressbar', () => {
    render(<RingProgress value={30} label="Storage used" />)

    const bar = screen.getByRole('progressbar', { name: 'Storage used' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuenow', '30')
  })

  it('clamps a value above the maximum', () => {
    render(<RingProgress value={140} max={100} label="Quota" />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('clamps a negative value', () => {
    render(<RingProgress value={-20} label="Quota" />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('writes the ratio as a percentage by default', () => {
    render(<RingProgress value={18} max={20} label="Seats" />)

    // 18 of 20 is 90%, not 18% — the percentage is of `max`.
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('draws only the track at zero', () => {
    const { container } = render(<RingProgress value={0} label="Quota" />)

    expect(container.querySelectorAll('circle')).toHaveLength(1)
  })

  it('advances the indicator as the value grows', () => {
    const offsetAt = (value: number) => {
      const { container, unmount } = render(<RingProgress value={value} label="Quota" />)
      const offset = Number(indicator(container)?.getAttribute('stroke-dashoffset'))
      unmount()
      return offset
    }

    expect(offsetAt(25)).toBeGreaterThan(offsetAt(75))
  })

  it('takes arbitrary centre content', () => {
    render(
      <RingProgress value={3} max={5} label="Runs">
        <span>3 runs</span>
      </RingProgress>
    )

    expect(screen.getByText('3 runs')).toBeInTheDocument()
  })

  it('formats the value when asked', () => {
    render(
      <RingProgress value={5} max={10} valueFormat={(value) => `${value} of 10`} label="Quota" />
    )

    expect(screen.getByText('5 of 10')).toBeInTheDocument()
  })

  it('renders the caption under the value', () => {
    render(<RingProgress value={72} caption="72 of 100 GB" label="Storage" />)

    expect(screen.getByText('72 of 100 GB')).toBeInTheDocument()
  })

  it('is decorative without a label', () => {
    render(<RingProgress value={10} />)

    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-label')
  })
})
