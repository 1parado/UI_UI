import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('announces itself as a live status region', () => {
    render(<Spinner />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('uses a custom label when given one', () => {
    render(<Spinner label="Fetching models" />)
    expect(screen.getByText('Fetching models')).toBeInTheDocument()
  })

  it('announces nothing when a visible label is present', () => {
    render(<Spinner label={null} data-testid="spinner" />)

    const status = screen.getByTestId('spinner')
    expect(status.textContent).toBe('')
    expect(status.querySelector('.sr-only')).toBeNull()
  })

  it('switches size through the variants', () => {
    const { rerender } = render(<Spinner size="lg" data-testid="spinner" />)

    const icon = screen.getByTestId('spinner').firstElementChild
    expect(icon?.getAttribute('class')).toContain('h-6')

    rerender(<Spinner size="sm" data-testid="spinner" />)
    expect(
      screen.getByTestId('spinner').firstElementChild?.getAttribute('class')
    ).toContain('h-3.5')
  })

  it('respects reduced-motion preferences', () => {
    render(<Spinner data-testid="spinner" />)
    expect(
      screen.getByTestId('spinner').firstElementChild?.getAttribute('class')
    ).toContain('motion-reduce:animate-none')
  })
})
