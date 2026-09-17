import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Watermark } from './Watermark'

const originalGetContext = HTMLCanvasElement.prototype.getContext

/**
 * jsdom has no rasteriser. A minimal 2D context is enough for the component's
 * arithmetic, and `toDataURL` gives it something to put in the background.
 */
function stubCanvas() {
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () =>
      ({
        font: '',
        fillStyle: '',
        textAlign: '',
        textBaseline: '',
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        measureText: (text: string) => ({ width: text.length * 8 }),
      }) as unknown as CanvasRenderingContext2D
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,stub')
}

function removeCanvas() {
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => null
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext
}

beforeEach(() => stubCanvas())
afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
})

const layer = () => document.querySelector('[data-slot="watermark-layer"]') as HTMLElement | null

describe('Watermark', () => {
  it('draws a layer from the content', async () => {
    render(
      <Watermark content="Acme Corp">
        <p>Secret</p>
      </Watermark>
    )

    expect(await screen.findByText('Secret')).toBeInTheDocument()
    expect(layer()).not.toBeNull()
    expect(layer()?.style.backgroundImage).toContain('data:image/png')
  })

  it('keeps the mark out of the accessibility tree and out of the way', () => {
    render(<Watermark content="Acme">Secret</Watermark>)

    expect(layer()).toHaveAttribute('aria-hidden')
    expect(layer()?.style.pointerEvents).toBe('none')
  })

  it('renders nothing to draw when there is no content', () => {
    render(<Watermark>Plain</Watermark>)

    expect(screen.getByText('Plain')).toBeInTheDocument()
    expect(layer()).toBeNull()
  })

  it('still renders its children where nothing can be rasterised', () => {
    removeCanvas()
    render(<Watermark content="Acme">Plain</Watermark>)

    expect(screen.getByText('Plain')).toBeInTheDocument()
    expect(layer()).toBeNull()
  })

  it('tiles every line it is given', () => {
    render(<Watermark content={['Acme Corp', 'draft']} />)

    expect(layer()).not.toBeNull()
  })

  it('honours the opacity and stacking it is given', () => {
    render(<Watermark content="Acme" opacity={0.4} zIndex={9} />)

    expect(layer()?.style.opacity).toBe('0.4')
    expect(layer()?.style.zIndex).toBe('9')
  })
})
