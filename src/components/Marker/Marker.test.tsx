import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Marker } from './Marker'

describe('Marker', () => {
  it('announces itself as a boundary', () => {
    render(<Marker>Today</Marker>)

    expect(screen.getByRole('separator')).toHaveTextContent('Today')
  })

  it('draws two hairlines around a labelled break', () => {
    const { container } = render(<Marker>Today</Marker>)

    // Both rules are decoration; only the label is content.
    const rules = container.querySelectorAll('[aria-hidden]')
    expect(rules).toHaveLength(2)
  })

  it('renders a pill', () => {
    render(<Marker variant="pill" tone="primary">New messages</Marker>)

    const marker = screen.getByRole('separator')
    expect(marker).toHaveTextContent('New messages')
    expect(marker.querySelector('span')).toHaveClass('rounded-full')
  })

  it('hides the unlabelled dashed rule from assistive tech', () => {
    const { container } = render(<Marker variant="dot" />)

    // A separator with no accessible name is noise, so this variant is
    // decoration only.
    expect(screen.queryByRole('separator')).toBeNull()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders nothing textual for dot even if given children', () => {
    const { container } = render(<Marker variant="dot">ignored</Marker>)

    expect(container.textContent).toBe('')
  })

  it('carries the tone into the dashed rule through currentColor', () => {
    const { container } = render(<Marker variant="dot" tone="destructive" />)

    expect(container.firstElementChild).toHaveClass('text-destructive')
    expect(container.querySelector('span')).toHaveClass('border-current')
  })
})
