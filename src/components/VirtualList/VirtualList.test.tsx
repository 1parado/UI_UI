import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VirtualList } from './VirtualList'

const items = Array.from({ length: 1000 }, (_, index) => `row ${index}`)

/**
 * jsdom has no layout engine, so every element reports zero size and a
 * virtualizer then correctly decides that nothing is visible.
 *
 * Note it measures the scroll element with `offsetWidth` / `offsetHeight`, not
 * `getBoundingClientRect()` — stubbing the rect alone leaves the list empty,
 * which looks exactly like a broken component.
 */
const WIDTH = 400
const HEIGHT = 600

describe('VirtualList', () => {
  let originalWidth: PropertyDescriptor | undefined
  let originalHeight: PropertyDescriptor | undefined

  beforeEach(() => {
    originalWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => WIDTH,
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => HEIGHT,
    })
  })

  afterEach(() => {
    if (originalWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalWidth)
    if (originalHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalHeight)
  })

  it('renders a window rather than the whole list', async () => {
    render(
      <VirtualList
        items={items}
        estimateSize={40}
        height={HEIGHT}
        renderItem={(item) => <div data-testid="row">{item}</div>}
      />
    )

    const rows = await screen.findAllByTestId('row')

    // 600 / 40 = 15 visible, plus overscan — and nowhere near 1000.
    expect(rows.length).toBeGreaterThan(10)
    expect(rows.length).toBeLessThan(60)
  })

  it('keeps the first rows in the DOM and the last ones out', async () => {
    render(
      <VirtualList
        items={items}
        estimateSize={40}
        height={HEIGHT}
        renderItem={(item) => <div data-testid="row">{item}</div>}
      />
    )

    await screen.findAllByTestId('row')

    expect(screen.getByText('row 0')).toBeInTheDocument()
    expect(screen.queryByText('row 900')).toBeNull()
  })

  it('sizes the inner track to the full list', () => {
    const { container } = render(
      <VirtualList
        items={items}
        estimateSize={40}
        height={HEIGHT}
        renderItem={(item) => <div>{item}</div>}
      />
    )

    // 1000 rows × 40px. The scrollbar has to be honest about the length even
    // though only a handful of rows exist.
    const track = container.querySelector('[data-index]')?.parentElement
    expect(track).toHaveStyle({ height: '40000px' })
  })

  it('positions each row by its offset', async () => {
    render(
      <VirtualList
        items={items}
        estimateSize={40}
        height={HEIGHT}
        renderItem={(item) => <div data-testid="row">{item}</div>}
      />
    )

    await screen.findAllByTestId('row')

    // Rows are absolutely positioned, so the index has to translate into a
    // pixel offset or they all stack on row 0.
    expect(screen.getByText('row 3').parentElement).toHaveStyle({
      transform: 'translateY(120px)',
    })
  })

  it('renders the empty slot when there is nothing', () => {
    render(
      <VirtualList
        items={[]}
        estimateSize={40}
        height={HEIGHT}
        empty="No matches"
        renderItem={(item) => <div>{item}</div>}
      />
    )

    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('calls onEndReached once the window reaches the end of a short list', async () => {
    const onEndReached = vi.fn()

    render(
      <VirtualList
        items={items.slice(0, 5)}
        estimateSize={40}
        height={HEIGHT}
        onEndReached={onEndReached}
        renderItem={(item) => <div data-testid="row">{item}</div>}
      />
    )

    await screen.findAllByTestId('row')

    expect(onEndReached).toHaveBeenCalledTimes(1)
  })

  it('does not call onEndReached while there is more to scroll', async () => {
    const onEndReached = vi.fn()

    render(
      <VirtualList
        items={items}
        estimateSize={40}
        height={HEIGHT}
        onEndReached={onEndReached}
        renderItem={(item) => <div data-testid="row">{item}</div>}
      />
    )

    await screen.findAllByTestId('row')

    expect(onEndReached).not.toHaveBeenCalled()
  })

  it('passes the caller props to the scroll box', () => {
    render(
      <VirtualList
        items={[]}
        estimateSize={40}
        height={300}
        aria-label="Search results"
        renderItem={(item) => <div>{item}</div>}
      />
    )

    expect(screen.getByLabelText('Search results')).toBeInTheDocument()
  })
})
