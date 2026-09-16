import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './Progress'

describe('Progress', () => {
  it('renders as a progressbar with correct ARIA values', () => {
    render(<Progress value={42} />)
    const progress = screen.getByRole('progressbar')

    expect(progress).toHaveAttribute('aria-valuemin', '0')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
    expect(progress).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps values above max', () => {
    render(<Progress value={150} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    )
  })

  it('clamps negative values to 0', () => {
    render(<Progress value={-10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    )
  })

  it('supports a custom max', () => {
    render(<Progress value={3} max={5} />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuemax', '5')
    expect(progress).toHaveAttribute('aria-valuenow', '3')
  })

  it('defaults to 0 when no value is given', () => {
    render(<Progress />)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    )
  })
})
