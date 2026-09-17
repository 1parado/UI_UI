import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stat } from './Stat'
import { TrendingUpIcon } from '@/lib/icons'

describe('Stat', () => {
  it('renders the label and the figure', () => {
    render(<Stat label="Revenue" value="¥128,400" />)

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('¥128,400')).toBeInTheDocument()
  })

  it('writes the delta as a signed percentage by default', () => {
    render(<Stat label="Signups" value="1,204" delta={8.1} />)

    expect(screen.getByText('+8.1%')).toBeInTheDocument()
  })

  it('treats a rise as good news by default', () => {
    const { container } = render(<Stat label="Signups" value="1,204" delta={8.1} />)

    expect(container.firstChild).toHaveAttribute('data-trend', 'up')
    expect(screen.getByText('+8.1%')).toHaveClass('text-success')
  })

  it('flips the colour when a rise is bad news', () => {
    render(<Stat label="Errors" value="412" delta={8.1} higherIsBetter={false} />)

    expect(screen.getByText('+8.1%')).toHaveClass('text-destructive')
  })

  it('reads a fall as good news when higherIsBetter is false', () => {
    render(<Stat label="Latency" value="184ms" delta={-14.6} higherIsBetter={false} />)

    expect(screen.getByText('-14.6%')).toHaveClass('text-success')
  })

  it('keeps a flat delta neutral', () => {
    const { container } = render(<Stat label="Uptime" value="99.98%" delta={0} />)

    expect(container.firstChild).toHaveAttribute('data-trend', 'flat')
    expect(screen.getByText('0.0%')).toHaveClass('text-muted-foreground')
  })

  it('accepts a custom delta format', () => {
    render(
      <Stat label="Storage" value="412 GB" delta={38} deltaFormat={(delta) => `+${delta} GB`} />
    )

    expect(screen.getByText('+38 GB')).toBeInTheDocument()
  })

  it('renders the delta label beside the number', () => {
    render(<Stat label="Signups" value="1,204" delta={8.1} deltaLabel="vs last week" />)

    expect(screen.getByText('vs last week')).toBeInTheDocument()
  })

  it('draws a sparkline when given a series', () => {
    const { container } = render(<Stat label="Tokens" value="1.24M" sparkline={[1, 2, 3, 4]} />)

    expect(container.querySelector('svg polyline')).toBeInTheDocument()
  })

  it('draws no sparkline without a series', () => {
    const { container } = render(<Stat label="Tokens" value="1.24M" />)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders the icon and the hint', () => {
    const { container } = render(
      <Stat label="Tokens" value="1.24M" icon={<TrendingUpIcon />} hint="Across all models" />
    )

    expect(screen.getByText('Across all models')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
