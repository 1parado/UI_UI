import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Diff, CodeDiff } from './Diff'

const writeText = vi.fn().mockResolvedValue(undefined)

function mockClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

afterEach(() => {
  writeText.mockClear()
})

const rows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-diff-line]'))

const kinds = (container: HTMLElement) =>
  rows(container).map((row) => row.getAttribute('data-diff-line'))

/** The old and new gutters of a unified row, in that order. */
const gutters = (row: Element) =>
  Array.from(row.querySelectorAll('span'))
    .slice(0, 2)
    .map((span) => span.textContent)

const folds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-diff-fold]'))

const file = (count: number, replace: Record<number, string> = {}) =>
  Array.from({ length: count }, (_, index) => replace[index + 1] ?? `line ${index + 1}`).join('\n')

describe('Diff', () => {
  it('renders one row per line, labelled by kind', () => {
    const { container } = render(<Diff before={'a\nb\nc'} after={'a\nB\nc'} />)

    expect(kinds(container)).toEqual(['context', 'remove', 'add', 'context'])
  })

  it('numbers both sides, leaving a gutter empty where the line does not exist', () => {
    const { container } = render(<Diff before={'a\nb\nc'} after={'a\nB\nc'} />)
    const [context, remove, add] = rows(container)

    expect(gutters(context)).toEqual(['1', '1'])
    expect(gutters(remove)).toEqual(['2', ''])
    expect(gutters(add)).toEqual(['', '2'])
  })

  it('hides the gutters when asked', () => {
    const { container } = render(<Diff before={'a'} after={'b'} showLineNumbers={false} />)
    const [row] = rows(container)

    expect(row.querySelectorAll('span')).toHaveLength(2) // sign and text
  })

  it('marks the change with a sign as well as a colour', () => {
    const { container } = render(<Diff before={'a'} after={'b'} />)
    const [remove, add] = rows(container)

    expect(remove.textContent).toContain('-')
    expect(add.textContent).toContain('+')
  })

  it('states that identical input has nothing to show', () => {
    const { container } = render(<Diff before={'same'} after={'same'} />)

    expect(container.querySelector('[data-diff-identical]')).toHaveTextContent('No changes')
    expect(rows(container)).toHaveLength(0)
  })

  it('folds the unchanged runs above and below the change', () => {
    const { container } = render(
      <Diff before={file(20)} after={file(20, { 11: 'changed' })} context={3} />
    )

    expect(folds(container).map((fold) => fold.getAttribute('data-diff-fold'))).toEqual(['7', '6'])
  })

  it('reveals a folded run on click', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Diff before={file(20)} after={file(20, { 11: 'changed' })} context={3} />
    )

    expect(rows(container)).toHaveLength(8)

    await user.click(screen.getByRole('button', { name: '7 unchanged lines' }))

    expect(rows(container)).toHaveLength(15)
    expect(screen.getByRole('button', { name: '7 unchanged lines' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('folds a single line in the singular', () => {
    render(<Diff before={file(6)} after={file(6, { 3: 'x', 6: 'y' })} context={1} />)

    expect(screen.getByRole('button', { name: '1 unchanged line' })).toBeInTheDocument()
  })

  it('leaves the fold static when it may not be opened', () => {
    const { container } = render(
      <Diff before={file(20)} after={file(20, { 11: 'changed' })} expandable={false} />
    )

    for (const fold of folds(container)) expect(fold.tagName).toBe('DIV')
  })

  it('strips context entirely at zero', () => {
    const { container } = render(
      <Diff before={file(20)} after={file(20, { 11: 'changed' })} context={0} />
    )

    expect(kinds(container)).toEqual(['remove', 'add'])
  })

  it('wraps long lines only when asked', () => {
    const long = 'x'.repeat(200)
    const { container: plain } = render(<Diff before={long} after={`${long}!`} />)
    const { container: wrapped } = render(<Diff before={long} after={`${long}!`} wrap />)

    const textOf = (container: HTMLElement) => rows(container)[0].querySelector('span:last-child')

    expect(textOf(plain)).toHaveClass('whitespace-pre')
    expect(textOf(wrapped)).toHaveClass('whitespace-pre-wrap')
  })

  it('replaces the fold wording when labels are given', () => {
    render(
      <Diff
        before={file(20)}
        after={file(20, { 11: 'changed' })}
        labels={{ unchangedLines: (count) => `展开 ${count} 行` }}
      />
    )

    expect(screen.getByRole('button', { name: '展开 7 行' })).toBeInTheDocument()
  })
})

describe('Diff header', () => {
  it('has no header by default', () => {
    render(<Diff before={'a'} after={'b'} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('counts the additions and removals', () => {
    const { container } = render(
      <Diff before={'a\nb\nc'} after={'a\nB\nC'} showHeader filename="x.ts" />
    )

    expect(container.textContent).toContain('+2')
    expect(container.textContent).toContain('-2')
    expect(screen.getByText('x.ts')).toBeInTheDocument()
  })

  it('offers both views and switches between them', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Diff before={file(20)} after={file(20, { 11: 'changed' })} showHeader />
    )

    expect(container.querySelector('[data-view="unified"]')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Split view' }))

    expect(container.querySelector('[data-view="split"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Split view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('puts a line that only exists on one side against an empty half', () => {
    const { container } = render(
      <Diff before={'a\nc'} after={'a\nb\nc'} showHeader defaultView="split" />
    )
    const splitRows = Array.from(container.querySelectorAll('[data-view="split"] > div'))

    expect(splitRows).toHaveLength(3)
    expect(splitRows[1].children[0].textContent).toBe('')
    expect(splitRows[1].children[1].textContent).toContain('b')
  })

  it('leaves the view alone when the caller owns it', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    const { container } = render(
      <Diff
        before={file(20)}
        after={file(20, { 11: 'changed' })}
        showHeader
        view="split"
        onViewChange={onViewChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Unified view' }))

    expect(onViewChange).toHaveBeenCalledWith('unified')
    expect(container.querySelector('[data-view="split"]')).toBeInTheDocument()
  })

  it('copies a patch file that git could read', async () => {
    const user = userEvent.setup()
    mockClipboard()
    render(<CodeDiff before={'a\nb\nc'} after={'a\nB\nc'} filename="src/greet.ts" />)

    await user.click(screen.getByRole('button', { name: 'Copy diff' }))

    const patch = writeText.mock.calls[0][0] as string
    expect(patch).toContain('--- a/src/greet.ts')
    expect(patch).toContain('+++ b/src/greet.ts')
    expect(patch).toContain('@@ -1,3 +1,3 @@')
    expect(patch).toContain('-b')
    expect(patch).toContain('+B')
  })

  it('has nothing to copy when the sides match', () => {
    render(<CodeDiff before={'a'} after={'a'} filename="x.ts" />)

    expect(screen.queryByRole('button', { name: 'Copy diff' })).not.toBeInTheDocument()
  })
})
