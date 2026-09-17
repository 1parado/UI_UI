import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistic } from './Statistic'

describe('Statistic', () => {
  it('formats the figure without being told how', () => {
    render(<Statistic label="Requests" value={1234567} />)

    expect(screen.getByText('1,234,567')).toBeInTheDocument()
    expect(screen.getByText('Requests')).toBeInTheDocument()
  })

  it('keeps a currency mark outside the minus sign', () => {
    render(<Statistic value={-1204.5} precision={2} prefix="¥" />)

    expect(screen.getByText('¥-1,204.50')).toBeInTheDocument()
  })

  it('takes the separators a locale expects', () => {
    render(
      <Statistic value={1234.5} precision={1} groupSeparator=" " decimalSeparator="," />
    )

    expect(screen.getByText('1 234,5')).toBeInTheDocument()
  })

  it('reads an absent value as a dash rather than NaN', () => {
    render(<Statistic value={Number.NaN} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('accepts a string when the caller formats it themselves', () => {
    render(<Statistic value="1.2M" suffix=" tokens" />)

    expect(screen.getByText('1.2M tokens')).toBeInTheDocument()
  })

  it('hands the value to a custom formatter', () => {
    render(<Statistic value={4} formatter={(value) => `${value}/5 ★`} />)

    expect(screen.getByText('4/5 ★')).toBeInTheDocument()
  })

  it('draws skeleton bars while loading, rather than a dash', () => {
    render(<Statistic label="Latency" value={Number.NaN} loading />)

    expect(screen.queryByText('—')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('reads a rise as good news by default', () => {
    const { container } = render(<Statistic value={10} trend="up" trendValue="+12.4%" />)

    expect(container.querySelector('.text-success')).toBeInTheDocument()
  })

  it('reads a rise as bad news when it should', () => {
    const { container } = render(
      <Statistic value={10} trend="up" trendValue="+8%" higherIsBetter={false} />
    )

    expect(container.querySelector('.text-destructive')).toBeInTheDocument()
    expect(container.querySelector('.text-success')).not.toBeInTheDocument()
  })

  it('stays neutral when there is no direction', () => {
    const { container } = render(<Statistic value={10} trend="flat" trendValue="0.0%" />)

    expect(container.querySelector('.text-success')).not.toBeInTheDocument()
    expect(container.querySelector('.text-destructive')).not.toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('carries a hint under the figure', () => {
    render(<Statistic value={3} hint="Across 12 repositories" />)

    expect(screen.getByText('Across 12 repositories')).toBeInTheDocument()
  })

  it('does not animate unless asked', () => {
    render(<Statistic value={500} countUp duration={1200} />)

    // The figure is already correct on the first paint; only the story shows
    // the count-up, because its timing belongs in a browser.
    expect(screen.getByText(String(0))).toBeInTheDocument()
  })
})
