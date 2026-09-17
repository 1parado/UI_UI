import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
} from './Skeleton'

/**
 * Every bar is `aria-hidden`, so these count shapes in the DOM rather than
 * asking the accessibility tree — which would report none of them.
 */
const barsIn = (node: HTMLElement) =>
  Array.from(node.querySelectorAll<HTMLElement>('[aria-busy="true"]'))

const named = (slot: string) =>
  document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

describe('Skeleton', () => {
  it('is decorative, never announced', () => {
    render(<Skeleton data-testid="bar" />)

    const bar = screen.getByTestId('bar')
    expect(bar).toHaveAttribute('aria-busy', 'true')
    expect(bar).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('SkeletonText', () => {
  it('draws the asked-for number of lines', () => {
    render(<SkeletonText lines={4} />)

    expect(barsIn(named('skeleton-text'))).toHaveLength(4)
  })

  it('leaves the last line short', () => {
    render(<SkeletonText lines={3} lastLineWidth={45} />)

    const lines = barsIn(named('skeleton-text'))
    expect(lines[0].style.width).toBe('100%')
    expect(lines[lines.length - 1].style.width).toBe('45%')
  })
})

describe('SkeletonAvatar', () => {
  it('is round and sized from the scale', () => {
    render(<SkeletonAvatar size="lg" />)

    const avatar = named('skeleton-avatar')
    expect(avatar.className).toContain('rounded-full')
    expect(avatar.style.width).toBe('40px')
    expect(avatar.style.height).toBe('40px')
  })

  it('lets a caller override the size', () => {
    render(<SkeletonAvatar size="sm" style={{ width: 64, height: 64 }} />)

    expect(named('skeleton-avatar').style.width).toBe('64px')
  })
})

describe('SkeletonCard', () => {
  it('carries an avatar and a paragraph', () => {
    render(<SkeletonCard lines={2} />)

    const card = named('skeleton-card')
    expect(card.querySelector('[data-slot="skeleton-avatar"]')).toBeInTheDocument()
    expect(barsIn(card.querySelector('[data-slot="skeleton-text"]') as HTMLElement)).toHaveLength(2)
  })

  it('drops the avatar when asked', () => {
    render(<SkeletonCard avatar={false} />)

    expect(
      named('skeleton-card').querySelector('[data-slot="skeleton-avatar"]')
    ).not.toBeInTheDocument()
  })
})

describe('SkeletonTable', () => {
  it('draws a header row on top of the body rows', () => {
    render(<SkeletonTable rows={3} columns={3} />)

    const table = named('skeleton-table')
    expect(table.children).toHaveLength(4)
    expect(barsIn(table)).toHaveLength(12)
  })

  it('leaves the header out when asked', () => {
    render(<SkeletonTable rows={2} columns={2} header={false} />)

    expect(named('skeleton-table').children).toHaveLength(2)
  })

  it('gives the first column the widest cell', () => {
    render(<SkeletonTable rows={1} columns={3} header={false} />)

    const cells = barsIn(named('skeleton-table'))
    expect(cells[0].style.width).toBe('40%')
    expect(cells[1].style.width).toBe('30%')
  })
})
