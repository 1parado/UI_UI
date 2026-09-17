import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tour } from './Tour'
import type { TourStep } from './Tour'

const steps: TourStep[] = [
  { target: '#save', title: 'Save', content: 'Your work lands immediately.' },
  { target: '#share', title: 'Share', content: 'Send a read-only link.' },
  { target: '#gone', title: 'Missing', content: 'This element is not on the page.' },
]

const card = () => screen.getByRole('dialog')

async function paintTargets() {
  // jsdom has no layout, so boxes have to be invented for the targets that
  // exist — and deliberately not invented for the missing one.
  const boxes: Record<string, DOMRect> = {
    '#save': { top: 100, left: 200, width: 120, height: 40 } as DOMRect,
    '#share': { top: 300, left: 400, width: 90, height: 32 } as DOMRect,
  }

  Element.prototype.getBoundingClientRect = function rect(this: Element): DOMRect {
    const id = this.id ? `#${this.id}` : ''
    return (
      boxes[id] ?? ({ top: 0, left: 0, width: 0, height: 0 } as DOMRect)
    )
  }
}

describe('Tour', () => {
  it('renders nothing while closed', () => {
    render(<Tour steps={steps} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('narrates the first step', async () => {
    await paintTargets()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen />
      </>
    )

    expect(card()).toHaveAccessibleName('Save')
    expect(screen.getByText('Your work lands immediately.')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('walks forward and back', async () => {
    const user = userEvent.setup()
    await paintTargets()
    const onStepChange = vi.fn()
    render(
      <>
        <button id="save">Save</button>
        <button id="share">Share</button>
        <Tour steps={steps} defaultOpen onStepChange={onStepChange} />
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(onStepChange).toHaveBeenCalledWith(1)

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('finishes instead of stepping past the last one', async () => {
    const user = userEvent.setup()
    await paintTargets()
    const onFinish = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen onFinish={onFinish} onOpenChange={onOpenChange} />
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ends on Escape and focuses itself so Escape lands here', async () => {
    const user = userEvent.setup()
    await paintTargets()
    const onOpenChange = vi.fn()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen onOpenChange={onOpenChange} />
      </>
    )

    expect(card()).toHaveFocus()
    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('drives itself from the arrow keys', async () => {
    const user = userEvent.setup()
    await paintTargets()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen />
      </>
    )

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('frames the target and dims everything else', async () => {
    await paintTargets()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen />
      </>
    )

    // Four bands, one per side — the tap target for "dismiss" as well as the
    // dimming, which is why they are rectangles and not one cut-out shape.
    const root = card().parentElement as HTMLElement
    expect(root.querySelectorAll('.bg-foreground\\/50')).toHaveLength(4)
    expect(root).toHaveAttribute('data-placement', 'bottom')
  })

  it('centres rather than skips a step whose target is gone', async () => {
    const user = userEvent.setup()
    await paintTargets()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen />
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('This element is not on the page.')).toBeInTheDocument()
    expect((card().parentElement as HTMLElement).dataset.placement).toBe('center')
  })

  it('leaves the first step without a Back button', async () => {
    await paintTargets()
    render(
      <>
        <button id="save">Save</button>
        <Tour steps={steps} defaultOpen />
      </>
    )

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })
})
