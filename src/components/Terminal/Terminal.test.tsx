import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Terminal } from './Terminal'
import { LogViewer } from './LogViewer'

const writeText = vi.fn().mockResolvedValue(undefined)

function mockClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

afterEach(() => {
  writeText.mockClear()
  vi.restoreAllMocks()
})

const region = () => screen.getByRole('log')

/** Pretends the scroll box has somewhere to scroll, then reports a position. */
const scrollTo = (element: HTMLElement, scrollTop: number, scrollHeight = 200, clientHeight = 100) => {
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true })
  element.scrollTop = scrollTop
  fireEvent.scroll(element)
}

describe('Terminal', () => {
  it('renders its lines inside a live log region', () => {
    render(<Terminal lines={['one', 'two']} />)

    expect(region()).toHaveTextContent('one')
    expect(region()).toHaveTextContent('two')
  })

  it('accepts either plain strings or line objects', () => {
    render(<Terminal lines={[{ id: 'a', text: 'structured' }]} />)

    expect(region()).toHaveTextContent('structured')
  })

  it('says so when there is nothing to show', () => {
    render(<Terminal lines={[]} />)

    expect(screen.getByText('No output yet')).toBeInTheDocument()
  })

  it('accepts a custom empty message and region name', () => {
    render(<Terminal lines={[]} emptyMessage="等待输出" labels={{ region: '构建输出' }} />)

    expect(screen.getByText('等待输出')).toBeInTheDocument()
    expect(screen.getByRole('log', { name: '构建输出' })).toBeInTheDocument()
  })

  it('colours an ANSI sequence', () => {
    const { container } = render(<Terminal lines={['\u001b[31mfailed\u001b[0m']} />)
    const styled = container.querySelector('[style]')

    expect(styled).toHaveTextContent('failed')
    expect(styled?.getAttribute('style')).toContain('--ansi-red')
  })

  it('leaves plain text as bare text, with no wrapper to style', () => {
    const { container } = render(<Terminal lines={['plain output']} />)

    expect(container.querySelector('[style]')).not.toBeInTheDocument()
  })

  it('shows the escapes verbatim when ANSI is off', () => {
    render(<Terminal lines={['\u001b[31mraw\u001b[0m']} ansi={false} />)

    expect(region().textContent).toContain('\u001b[31m')
  })

  it('renders a gutter slot before the text', () => {
    render(<Terminal lines={[{ text: 'with a chip', gutter: <span data-testid="chip">E</span> }]} />)

    expect(screen.getByTestId('chip')).toBeInTheDocument()
  })

  it('shows a timestamp when asked', () => {
    render(
      <Terminal
        timestamps
        lines={[{ text: 'stamped', timestamp: '2026-09-17T09:20:21Z' }]}
      />
    )

    expect(region().textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('wraps by default and keeps lines intact when told to', () => {
    const { container: wrapped } = render(<Terminal lines={['a'.repeat(200)]} />)
    const { container: plain } = render(<Terminal lines={['a'.repeat(200)]} wrap={false} />)

    const row = (container: HTMLElement) => container.querySelector('[class*="whitespace-"]')

    expect(row(wrapped)).toHaveClass('whitespace-pre-wrap')
    expect(row(plain)).toHaveClass('whitespace-pre')
  })

  it('keeps only the last lines and says how many it dropped', () => {
    render(<Terminal lines={['L1', 'L2', 'L3', 'L4']} maxLines={2} />)

    expect(region()).toHaveTextContent('2 earlier lines hidden')
    expect(region()).toHaveTextContent('L4')
    expect(region()).not.toHaveTextContent('L1')
  })

  it('keeps everything when there is no limit', () => {
    render(<Terminal lines={['L1', 'L2', 'L3']} maxLines={0} />)

    expect(region()).not.toHaveTextContent('hidden')
    expect(region()).toHaveTextContent('L1')
  })

  it('draws a caret while something is still running', () => {
    render(<Terminal lines={['working…']} pending />)

    expect(region().textContent).toContain('▍')
  })

  it('follows new output', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    const { rerender } = render(<Terminal lines={['first']} />)
    scrollIntoView.mockClear()

    rerender(<Terminal lines={['first', 'second']} />)

    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('pauses following when the user scrolls up, and offers a way back', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<Terminal lines={['a', 'b', 'c']} />)

    scrollTo(region(), 0)
    scrollIntoView.mockClear()

    expect(screen.getByRole('button', { name: 'Jump to latest' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Jump to latest' }))

    expect(scrollIntoView).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Jump to latest' })).not.toBeInTheDocument()
  })

  it('does not offer the jump when following is not on offer', () => {
    render(<Terminal lines={['a']} autoScroll={false} />)

    expect(screen.queryByRole('button', { name: 'Jump to latest' })).not.toBeInTheDocument()
  })

  it('clears the view without touching the lines it was given', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<Terminal lines={['a', 'b']} onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Clear output' }))

    expect(screen.getByText('No output yet')).toBeInTheDocument()
    expect(onClear).toHaveBeenCalled()
  })

  it('shows output that arrives after a clear', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Terminal lines={['old']} />)

    await user.click(screen.getByRole('button', { name: 'Clear output' }))
    rerender(<Terminal lines={['old', 'fresh']} />)

    expect(region()).toHaveTextContent('fresh')
    expect(region()).not.toHaveTextContent('old')
  })

  it('copies the visible text, escapes removed', async () => {
    const user = userEvent.setup()
    mockClipboard()
    render(<Terminal lines={['\u001b[32mok\u001b[0m', 'done']} />)

    await user.click(screen.getByRole('button', { name: 'Copy output' }))

    expect(writeText).toHaveBeenCalledWith('ok\ndone')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('leaves the header out when asked', () => {
    render(<Terminal lines={['a']} showHeader={false} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('drops the copy control but keeps the clear control', () => {
    render(<Terminal lines={['a']} copyable={false} />)

    expect(screen.queryByRole('button', { name: 'Copy output' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear output' })).toBeInTheDocument()
  })
})

const log = [
  '2026-09-17T09:20:21Z INFO  server listening on 3000',
  '2026-09-17T09:20:22Z DEBUG compiled in 214ms',
  '2026-09-17T09:20:23Z WARN  slow query took 812ms',
  '2026-09-17T09:20:24Z ERROR request failed: timeout',
]

describe('LogViewer', () => {
  it('reads the level off each line', () => {
    render(<LogViewer lines={log} />)

    expect(screen.getByText('info')).toBeInTheDocument()
    expect(screen.getByText('warn')).toBeInTheDocument()
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('counts the lines and each level', () => {
    render(<LogViewer lines={log} />)

    expect(screen.getByText('4 lines')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Info/ })).toHaveTextContent('1')
    expect(screen.getByRole('button', { name: /Error/ })).toHaveTextContent('1')
  })

  it('shows only the level that was picked', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={log} />)

    await user.click(screen.getByRole('button', { name: /Error/ }))

    expect(region()).toHaveTextContent('request failed')
    expect(region()).not.toHaveTextContent('listening on 3000')
    expect(screen.getByText('1 of 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Error/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows everything again when the picked level is clicked twice', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={log} />)

    await user.click(screen.getByRole('button', { name: /Error/ }))
    await user.click(screen.getByRole('button', { name: /Error/ }))

    expect(region()).toHaveTextContent('listening on 3000')
    expect(screen.getByText('4 lines')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Error/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('searches the message text', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={log} />)

    await user.type(screen.getByRole('searchbox', { name: 'Filter output' }), 'slow')

    expect(region()).toHaveTextContent('slow query')
    expect(region()).not.toHaveTextContent('listening on 3000')
  })

  it('clears the search', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={log} />)

    await user.type(screen.getByRole('searchbox', { name: 'Filter output' }), 'slow')
    await user.click(screen.getByRole('button', { name: 'Clear filter' }))

    expect(screen.getByRole('searchbox', { name: 'Filter output' })).toHaveValue('')
    expect(region()).toHaveTextContent('listening on 3000')
  })

  it('states that nothing matched', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={log} />)

    await user.type(screen.getByRole('searchbox', { name: 'Filter output' }), 'zzz')

    expect(screen.getByText('No lines match')).toBeInTheDocument()
  })

  it('lets an entry declare a level the text does not', async () => {
    const user = userEvent.setup()
    render(<LogViewer lines={[{ text: 'something broke', level: 'error' }]} />)

    expect(screen.getByText('error')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Warn/ }))

    expect(region()).not.toHaveTextContent('something broke')
  })

  it('leaves the level filter to the caller when it is controlled', async () => {
    const user = userEvent.setup()
    const onLevelsChange = vi.fn()
    render(
      <LogViewer
        lines={log}
        levels={['info', 'debug', 'warn']}
        onLevelsChange={onLevelsChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /Error/ }))

    expect(onLevelsChange).toHaveBeenCalledWith(['error'])
    // Still showing what the caller chose, not what was clicked.
    expect(region()).toHaveTextContent('listening on 3000')
    expect(region()).not.toHaveTextContent('request failed')
  })

  it('shows the levels the caller picked, without a chip being soloed', () => {
    render(<LogViewer lines={log} levels={['error', 'warn']} />)

    expect(region()).toHaveTextContent('request failed')
    expect(region()).toHaveTextContent('slow query')
    expect(region()).not.toHaveTextContent('listening on 3000')
    expect(screen.getByRole('button', { name: /Error/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Info/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('can drop the toolbar entirely', () => {
    render(<LogViewer lines={log} filterable={false} searchable={false} />)

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Error/ })).not.toBeInTheDocument()
  })

  it('keeps the terminal controls it inherits', () => {
    render(<LogViewer lines={log} title="worker" />)

    expect(screen.getByText('worker')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear output' })).toBeInTheDocument()
  })
})
