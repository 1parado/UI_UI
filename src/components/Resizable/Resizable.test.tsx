import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable'

const Demo = ({
  storageKey,
  direction = 'horizontal' as const,
  withHandle = true,
}: {
  storageKey?: string
  direction?: 'horizontal' | 'vertical'
  withHandle?: boolean
}) => (
  <ResizablePanelGroup
    direction={direction}
    storageKey={storageKey}
    defaultLayout={{ a: 30, b: 70 }}
  >
    <ResizablePanel id="a">Left</ResizablePanel>
    <ResizableHandle withHandle={withHandle} />
    <ResizablePanel id="b">Right</ResizablePanel>
  </ResizablePanelGroup>
)

const panel = (id: string) => document.querySelector(`[data-panel][id="${id}"]`) as HTMLElement

describe('Resizable', () => {
  it('renders the panels and a draggable divider', () => {
    render(<Demo />)

    expect(screen.getByText('Left')).toBeInTheDocument()
    expect(screen.getByText('Right')).toBeInTheDocument()

    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-valuenow', '30')
    expect(separator).toHaveAttribute('tabindex', '0')
  })

  it('applies the default layout', () => {
    render(<Demo />)

    // v4 expresses the split as flex-grow on the panel.
    expect(panel('a').style.flexGrow).toBe('30')
    expect(panel('b').style.flexGrow).toBe('70')
  })

  it('points aria-controls at the panel it resizes', () => {
    render(<Demo />)

    const separator = screen.getByRole('separator')
    const controlled = separator.getAttribute('aria-controls')
    expect(controlled).toBeTruthy()
    expect(document.getElementById(controlled!)).toHaveAttribute('data-panel')
  })

  it('draws a grip only when asked', () => {
    const { unmount } = render(<Demo />)
    expect(screen.getByRole('separator').querySelector('svg')).not.toBeNull()
    unmount()

    render(<Demo withHandle={false} />)
    expect(screen.getByRole('separator').querySelector('svg')).toBeNull()
  })

  it('puts the divider in the tab order', () => {
    render(<Demo />)

    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('tabindex', '0')

    separator.focus()
    expect(separator).toHaveFocus()

    // The arrow keys deliberately are not pressed here. With no layout engine
    // the library has no panel sizes to adjust from and throws
    // `Previous layout not found for panel index 0` from inside its own key
    // handler — which surfaces as an unhandled error, not a failed assertion.
    // Keyboard resizing is a browser-level behaviour.
  })

  it('lays a vertical group out as a column', () => {
    const { container } = render(
      <ResizablePanelGroup direction="vertical" defaultLayout={{ a: 50, b: 50 }}>
        <ResizablePanel id="a">Top</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">Bottom</ResizablePanel>
      </ResizablePanelGroup>
    )

    const group = container.querySelector('[data-group]') as HTMLElement
    expect(group.style.flexDirection).toBe('column')

    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    // A vertical split needs a horizontal hairline, not a vertical one.
    expect(separator).toHaveClass('h-px')
    expect(separator).toHaveClass('w-full')
  })

  it('restores a saved split, which outranks the default layout', () => {
    window.localStorage.setItem('editor-split', JSON.stringify({ a: 65, b: 35 }))

    try {
      render(<Demo storageKey="editor-split" />)

      expect(panel('a').style.flexGrow).toBe('65')
    } finally {
      window.localStorage.removeItem('editor-split')
    }
  })

  it('survives a corrupt saved split', () => {
    window.localStorage.setItem('editor-split', '{not json')

    try {
      render(<Demo storageKey="editor-split" />)

      // Falls back to the default layout instead of throwing on mount.
      expect(panel('a').style.flexGrow).toBe('30')
    } finally {
      window.localStorage.removeItem('editor-split')
    }
  })

  it('ignores a storage entry when no key is given', () => {
    window.localStorage.setItem('editor-split', JSON.stringify({ a: 65, b: 35 }))

    try {
      render(<Demo />)

      expect(panel('a').style.flexGrow).toBe('30')
    } finally {
      window.localStorage.removeItem('editor-split')
    }
  })
})
