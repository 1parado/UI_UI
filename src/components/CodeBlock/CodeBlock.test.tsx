import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeBlock } from './CodeBlock'

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

describe('CodeBlock', () => {
  it('renders the language label and the code', () => {
    render(<CodeBlock language="ts" code="const a = 1" />)

    expect(screen.getByText('ts')).toBeInTheDocument()
    expect(screen.getByText('const a = 1')).toBeInTheDocument()
  })

  it('falls back to a text label when no language is given', () => {
    render(<CodeBlock code="plain output" />)

    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('copies the code and confirms it', async () => {
    const user = userEvent.setup()
    mockClipboard()
    render(<CodeBlock language="ts" code="const a = 1" />)

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith('const a = 1')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('copies the rendered text when only highlighted children are given', async () => {
    const user = userEvent.setup()
    mockClipboard()
    render(
      <CodeBlock language="ts">
        <span className="hljs-keyword">const</span> a = 1
      </CodeBlock>
    )

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith('const a = 1')
  })

  it('stays silent when the clipboard is unavailable', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
    render(<CodeBlock code="const a = 1" />)

    await user.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })
})
