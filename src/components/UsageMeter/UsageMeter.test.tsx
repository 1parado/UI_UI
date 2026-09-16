import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageMeter } from './UsageMeter'

function bar(container: HTMLElement): HTMLElement {
  const indicator = container.querySelector('[role="progressbar"] > div')
  if (!indicator) throw new Error('progress indicator not found')
  return indicator as HTMLElement
}

describe('UsageMeter', () => {
  it('formats used and max compactly and exposes them to assistive tech', () => {
    const { container } = render(
      <UsageMeter label="Tokens" used={12400} max={50000} />
    )

    expect(screen.getByText('12.4K / 50K')).toBeInTheDocument()

    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '12400')
    expect(progress).toHaveAttribute('aria-valuemax', '50000')
    expect(bar(container)).toHaveClass('bg-primary')
  })

  it('shows the bare amount, without a bar, when there is no budget', () => {
    render(<UsageMeter label="Tokens" used={1843200} />)

    expect(screen.getByText('1.8M')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('turns amber near the limit and red past it', () => {
    const { container, rerender } = render(
      <UsageMeter label="Tokens" used={8500} max={10000} />
    )
    expect(bar(container)).toHaveClass('bg-warning')

    rerender(<UsageMeter label="Tokens" used={11000} max={10000} />)
    expect(bar(container)).toHaveClass('bg-destructive')
  })

  it('accepts a custom formatter for currency', () => {
    render(
      <UsageMeter
        label="Spend"
        used={4.82}
        max={20}
        format={(used, max) => `$${used.toFixed(2)} / $${max?.toFixed(2)}`}
      />
    )

    expect(screen.getByText('$4.82 / $20.00')).toBeInTheDocument()
  })
})
