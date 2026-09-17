import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Cropper } from './Cropper'
import type { CropperHandle } from './Cropper'

/**
 * Three things jsdom does not have, stubbed once for the whole file.
 *
 * - **A 2D context.** `getContext` would otherwise emit a "not implemented"
 *   error on every export; stubbing it also makes `drawImage` observable.
 * - **Layout.** A `ResizeObserver` that waits to be told something would leave
 *   the cropper zero wide forever, so this one reports a plausible box the
 *   moment it is asked to observe.
 * - **Pointer events.** Without `PointerEvent`, testing-library falls back to a
 *   plain `Event` and `clientX` never reaches the handler — every drag would
 *   move by `NaN`. Deriving the stub from `MouseEvent` keeps the coordinates.
 */
const drawImage = vi.fn()

class ReportingResizeObserver {
  constructor(private readonly report: (entries: unknown[]) => void) {}

  observe() {
    this.report([{ contentRect: { width: 600, height: 320 } }])
  }

  unobserve() {}
  disconnect() {}
}

class PointerEventStub extends MouseEvent {
  pointerId: number

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 1
  }
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ReportingResizeObserver)
  vi.stubGlobal('PointerEvent', PointerEventStub)

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/png;base64,cropped'
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  drawImage.mockReset()
})

/** jsdom loads nothing by itself, so the image has to report its own size. */
async function loadImage(naturalWidth = 1600, naturalHeight = 900) {
  const image = document.querySelector('img') as HTMLImageElement

  Object.defineProperties(image, {
    naturalWidth: { value: naturalWidth, configurable: true },
    naturalHeight: { value: naturalHeight, configurable: true },
  })

  fireEvent.load(image)
}

const image = () => document.querySelector('img') as HTMLImageElement
const cropWindow = () => document.querySelector('[data-crop-window]') as HTMLElement

describe('Cropper', () => {
  it('draws the crop window over the picture', async () => {
    render(<Cropper src="/photo.jpg" />)
    await loadImage()

    expect(cropWindow()).toBeInTheDocument()
    expect(image()).toHaveAttribute('src', '/photo.jpg')
  })

  it('sizes the picture so it covers the whole cropper', async () => {
    render(<Cropper src="/photo.jpg" height={300} />)
    await loadImage(1600, 900)

    // 600 × 320 of container against a 16:9 picture: the height fills and the
    // sides spill over, which is what "cover" means.
    expect(image().style.width).toBe('600px')
    expect(Number(image().style.height.replace('px', ''))).toBeGreaterThan(320)
  })

  it('exports through its handle once the picture has loaded', async () => {
    const handle = { current: null as CropperHandle | null }
    render(<Cropper ref={handle} src="/photo.jpg" />)
    await loadImage()

    expect(handle.current?.toDataURL()).toBe('data:image/png;base64,cropped')
    expect(drawImage).toHaveBeenCalledTimes(1)
  })

  it('crops at the source resolution rather than the preview size', async () => {
    render(<Cropper src="/photo.jpg" outputWidth={1200} onCrop={() => {}} />)
    await loadImage()

    fireEvent.click(screen.getByRole('button', { name: 'Crop' }))

    const source = drawImage.mock.calls[0]
    // The window spans a picture drawn 1600 source pixels wide, so that is how
    // much goes in — not the 600px the preview measures.
    expect(source[3]).toBeGreaterThan(1000)
    expect(source[7]).toBe(1200)
  })

  it('answers nothing before there is a picture', () => {
    const handle = { current: null as CropperHandle | null }
    render(<Cropper ref={handle} src="/photo.jpg" />)

    expect(handle.current?.toDataURL()).toBeNull()
  })

  it('hands the crop to its caller', async () => {
    const onCrop = vi.fn()
    render(<Cropper src="/photo.jpg" onCrop={onCrop} />)
    await loadImage()

    fireEvent.click(screen.getByRole('button', { name: 'Crop' }))

    expect(onCrop).toHaveBeenCalledWith('data:image/png;base64,cropped')
  })

  it('leaves the crop button off when nobody is listening', () => {
    render(<Cropper src="/photo.jpg" />)

    expect(screen.getByRole('button', { name: 'Crop' })).toBeDisabled()
  })

  it('drags the picture under the window', async () => {
    render(<Cropper src="/photo.jpg" />)
    await loadImage()
    const before = image().style.top

    fireEvent.pointerDown(image(), { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(image(), { clientX: 100, clientY: 130, pointerId: 1 })
    fireEvent.pointerUp(image(), { clientX: 100, clientY: 130, pointerId: 1 })

    expect(image().style.top).not.toBe(before)
  })

  it('refuses to drag the picture away from covering the window', async () => {
    render(<Cropper src="/photo.jpg" />)
    await loadImage()

    fireEvent.pointerDown(image(), { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(image(), { clientX: 100, clientY: 900, pointerId: 1 })
    fireEvent.pointerUp(image(), { clientX: 100, clientY: 900, pointerId: 1 })

    // The picture is 337.5px tall in a 320px box, so it starts 8.75px above
    // the top and has exactly that much room to give: it slides until its top
    // edge is flush with the container and not a pixel further, because any
    // more would leave the crop window sitting over bare background.
    expect(image().style.top).toBe('0px')
  })

  it('rounds the window for a circle crop', async () => {
    render(<Cropper src="/photo.jpg" shape="circle" aspect={1} />)
    await loadImage()

    expect(cropWindow()).toHaveClass('rounded-full')
  })

  it('puts the picture back where it started', async () => {
    const handle = { current: null as CropperHandle | null }
    render(<Cropper ref={handle} src="/photo.jpg" />)
    await loadImage()
    const centred = image().style.top

    fireEvent.pointerDown(image(), { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(image(), { clientX: 100, clientY: 140, pointerId: 1 })
    fireEvent.pointerUp(image(), { clientX: 100, clientY: 140, pointerId: 1 })

    // The handle is called from outside React's rendering, so its state update
    // needs flushing before the DOM can be read back.
    act(() => {
      handle.current?.reset()
    })

    expect(image().style.top).toBe(centred)
  })
})
