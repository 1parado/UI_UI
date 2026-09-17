import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DirectionProvider,
  resolveDirection,
  useDirection,
  useDirectionControls,
} from './Direction'

const Reader = () => <span data-testid="dir">{useDirection()}</span>

const Switcher = () => {
  const { dir, setDir } = useDirectionControls()
  return (
    <button type="button" onClick={() => setDir(dir === 'ltr' ? 'rtl' : 'ltr')}>
      {dir}
    </button>
  )
}

describe('resolveDirection', () => {
  it('defaults to ltr when nothing declares a direction', () => {
    expect(resolveDirection()).toBe('ltr')
  })

  it('reads the nearest dir attribute', () => {
    const { container } = render(<div dir="rtl" />)

    expect(resolveDirection(container.firstElementChild)).toBe('rtl')
  })

  it('falls back past an ancestor that does not declare one', () => {
    const { container } = render(
      <div dir="rtl">
        <span data-testid="leaf" />
      </div>
    )

    expect(resolveDirection(screen.getByTestId('leaf'))).toBe('rtl')
    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})

describe('DirectionProvider', () => {
  it('reports the controlled direction to the tree', () => {
    render(
      <DirectionProvider dir="rtl">
        <Reader />
      </DirectionProvider>
    )

    expect(screen.getByTestId('dir')).toHaveTextContent('rtl')
  })

  it('owns the direction when it is not controlled', async () => {
    const user = userEvent.setup()

    render(
      <DirectionProvider defaultDir="ltr">
        <Switcher />
      </DirectionProvider>
    )

    expect(screen.getByRole('button')).toHaveTextContent('ltr')

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('rtl')
  })

  it('does not change a controlled direction on its own, but reports the intent', async () => {
    const user = userEvent.setup()
    const onDirChange = vi.fn()

    render(
      <DirectionProvider dir="ltr" onDirChange={onDirChange}>
        <Switcher />
      </DirectionProvider>
    )

    await user.click(screen.getByRole('button'))

    expect(onDirChange).toHaveBeenCalledWith('rtl')
    // The caller owns the value, so nothing moved until they pass it back.
    expect(screen.getByRole('button')).toHaveTextContent('ltr')
  })

  it('leaves the document alone by default', () => {
    render(
      <DirectionProvider dir="rtl">
        <Reader />
      </DirectionProvider>
    )

    expect(document.documentElement).not.toHaveAttribute('dir')
  })

  it('mirrors onto the document when asked, and restores it on unmount', () => {
    const { unmount } = render(
      <DirectionProvider dir="rtl" applyToDocument>
        <Reader />
      </DirectionProvider>
    )

    expect(document.documentElement).toHaveAttribute('dir', 'rtl')

    unmount()

    expect(document.documentElement).not.toHaveAttribute('dir')
  })

  it('falls back to the document when there is no provider', () => {
    document.documentElement.setAttribute('dir', 'rtl')

    try {
      render(<Reader />)

      // An app that sets `dir` on `<html>` and never mounts a provider is the
      // common case, so it has to work.
      expect(screen.getByTestId('dir')).toHaveTextContent('rtl')
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })

  it('gives a usable no-op setter outside a provider', async () => {
    const user = userEvent.setup()

    render(<Switcher />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('ltr')
  })
})
