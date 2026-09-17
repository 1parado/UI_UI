import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Affix } from './Affix'

const originalRect = Element.prototype.getBoundingClientRect

/** jsdom has no layout, so every box has to be invented. */
function stubRect(box: Partial<DOMRect>) {
  Element.prototype.getBoundingClientRect = function rect(): DOMRect {
    return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}), ...box } as DOMRect
  }
}

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalRect
})

describe('Affix', () => {
  it('renders its child untouched while there is room', () => {
    stubRect({ top: 200, width: 120, height: 40, left: 16, bottom: 240 })
    render(
      <Affix offsetTop={64}>
        <button>Toolbar</button>
      </Affix>
    )

    const wrapper = screen.getByText('Toolbar').parentElement?.parentElement
    expect(wrapper).not.toHaveAttribute('data-affixed')
  })

  it('pins once the top passes the offset', () => {
    stubRect({ top: -10, width: 120, height: 40, left: 16, bottom: 30 })
    const onChange = vi.fn()
    render(
      <Affix offsetTop={64} onChange={onChange}>
        <button>Toolbar</button>
      </Affix>
    )

    const wrapper = screen.getByText('Toolbar').parentElement?.parentElement
    expect(wrapper).toHaveAttribute('data-affixed')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('holds the child box while pinned so the layout does not shift', () => {
    stubRect({ top: -10, width: 120, height: 40, left: 16, bottom: 30 })
    render(
      <Affix offsetTop={64}>
        <button>Toolbar</button>
      </Affix>
    )

    const wrapper = screen.getByText('Toolbar').parentElement?.parentElement
    expect(wrapper?.style.width).toBe('120px')
    expect(wrapper?.style.height).toBe('40px')
  })

  it('pins to the bottom instead when given offsetBottom', () => {
    // Bottom of the box (300) is 100px past the 200px viewport.
    stubRect({ top: 260, bottom: 300, width: 120, height: 40, left: 16 })
    Object.defineProperty(window, 'innerHeight', { value: 200, configurable: true })

    render(
      <Affix offsetBottom={24}>
        <button>Bar</button>
      </Affix>
    )

    const wrapper = screen.getByText('Bar').parentElement?.parentElement
    expect(wrapper).toHaveAttribute('data-affixed')
    const inner = screen.getByText('Bar').parentElement
    expect(inner?.style.bottom).toBe('24px')
    expect(inner?.style.top).toBe('')
  })

  it('reports the change on the way back out', () => {
    const onChange = vi.fn()
    stubRect({ top: -10, width: 120, height: 40, left: 16 })
    const { unmount } = render(
      <Affix offsetTop={64} onChange={onChange}>
        <button>Toolbar</button>
      </Affix>
    )
    expect(onChange).toHaveBeenCalledTimes(1)

    unmount()
    // Nothing after unmount — the listener goes with it.
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('does nothing when there is no layout to measure', () => {
    stubRect({ top: 0, width: 0, height: 0, left: 0 })
    const onChange = vi.fn()
    render(
      <Affix offsetTop={64} onChange={onChange}>
        <button>Toolbar</button>
      </Affix>
    )

    expect(onChange).not.toHaveBeenCalled()
  })
})
