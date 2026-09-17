import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Signature } from './Signature'
import type { SignatureHandle } from './Signature'

/**
 * jsdom has no canvas, and its `getContext` would otherwise emit a
 * "not implemented" error for every render. Stubbing the 2D context here also
 * makes the drawing calls observable, which is what most of these tests read.
 */
function stubCanvas() {
  const ctx = {
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    strokeStyle: '',
    fillStyle: '',
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
  }

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/png;base64,signature'
  )

  return ctx
}

afterEach(() => {
  vi.restoreAllMocks()
})

const pad = () => document.querySelector('canvas') as HTMLCanvasElement

async function draw(pointerId = 1) {
  fireEvent.pointerDown(pad(), { clientX: 10, clientY: 10, pointerId })
  fireEvent.pointerMove(pad(), { clientX: 40, clientY: 40, pointerId })
  fireEvent.pointerUp(pad(), { clientX: 40, clientY: 40, pointerId })
}

describe('Signature', () => {
  it('says what it wants until something is drawn', async () => {
    stubCanvas()
    render(<Signature />)

    expect(screen.getByText('Sign here')).toBeInTheDocument()

    await draw()

    expect(screen.queryByText('Sign here')).not.toBeInTheDocument()
  })

  it('hands the signed image over when the pen lifts', async () => {
    stubCanvas()
    const onChange = vi.fn()
    render(<Signature onChange={onChange} />)

    await draw()

    expect(onChange).toHaveBeenCalledWith('data:image/png;base64,signature')
  })

  it('draws a dot for a tap, rather than nothing', async () => {
    const ctx = stubCanvas()
    render(<Signature />)

    fireEvent.pointerDown(pad(), { clientX: 12, clientY: 12, pointerId: 3 })
    fireEvent.pointerUp(pad(), { clientX: 12, clientY: 12, pointerId: 3 })

    expect(ctx.lineTo).toHaveBeenCalled()
  })

  it('undoes one stroke and leaves the others', async () => {
    stubCanvas()
    const onChange = vi.fn()
    render(<Signature onChange={onChange} />)

    await draw(1)
    await draw(2)
    const afterTwo = onChange.mock.calls.length

    await fireEvent.click(screen.getByRole('button', { name: /Undo/ }))

    // Something is still on the pad, so another image is offered — not `null`.
    expect(onChange.mock.calls.length).toBe(afterTwo + 1)
    expect(onChange).toHaveBeenLastCalledWith('data:image/png;base64,signature')

    await fireEvent.click(screen.getByRole('button', { name: /Undo/ }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByText('Sign here')).toBeInTheDocument()
  })

  it('clears the whole pad', async () => {
    stubCanvas()
    const onChange = vi.fn()
    render(<Signature onChange={onChange} />)

    await draw()
    await fireEvent.click(screen.getByRole('button', { name: /Clear/ }))

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByText('Sign here')).toBeInTheDocument()
  })

  it('keeps the pen down on a disabled pad', async () => {
    stubCanvas()
    const onChange = vi.fn()
    render(<Signature disabled onChange={onChange} />)

    await draw()

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Clear/ })).toBeDisabled()
  })

  it('lets the caller drive it through its handle', async () => {
    stubCanvas()
    const handle = { current: null as SignatureHandle | null }
    render(<Signature ref={handle} />)

    expect(handle.current?.isEmpty()).toBe(true)

    await draw()

    expect(handle.current?.isEmpty()).toBe(false)
    expect(handle.current?.toDataURL()).toBe('data:image/png;base64,signature')

    handle.current?.clear()
    expect(handle.current?.isEmpty()).toBe(true)
  })

  it('paints in the colour it was given', async () => {
    const ctx = stubCanvas()
    render(<Signature penColor="#123456" lineWidth={4} />)

    await draw()

    expect(ctx.strokeStyle).toBe('#123456')
    expect(ctx.lineWidth).toBe(4)
  })
})
