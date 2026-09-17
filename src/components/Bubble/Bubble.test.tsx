import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Bubble, BubbleGroup, BubbleMeta } from './Bubble'

describe('Bubble', () => {
  it('records which end of the thread it is on', () => {
    const { container } = render(<Bubble side="out">On my way</Bubble>)

    expect(container.firstElementChild).toHaveAttribute('data-side', 'out')
  })

  it('names the delivery state for assistive tech', () => {
    render(<Bubble status="read">Delivered</Bubble>)

    expect(screen.getByRole('img', { name: 'Read' })).toBeInTheDocument()
  })

  it('takes label overrides', () => {
    render(
      <Bubble status="error" labels={{ error: '发送失败' }}>
        Failed
      </Bubble>
    )

    expect(screen.getByRole('img', { name: '发送失败' })).toBeInTheDocument()
  })

  it('shows the meta line only when there is something to show', () => {
    const { container: withoutMeta } = render(<Bubble>plain</Bubble>)
    expect(withoutMeta.querySelector('[data-slot="bubble-meta"]')).toBeNull()

    const { container: withMeta } = render(
      <Bubble meta="09:20" status="sent">
        sent
      </Bubble>
    )
    expect(withMeta).toHaveTextContent('09:20')
    expect(withMeta.querySelector('[data-slot="bubble-meta"]')).not.toBeNull()
    expect(screen.getByRole('img', { name: 'Sent' })).toBeInTheDocument()
  })

  it('squares off the corner it points from when it carries a tail', () => {
    const { container } = render(
      <Bubble side="out" tail>
        Last of the run
      </Bubble>
    )

    expect(container.querySelector('[data-slot="bubble"]')).toHaveClass('rounded-br-sm')
  })

  it('leaves the corner round when it is mid-run', () => {
    const { container } = render(<Bubble side="out">Middle of the run</Bubble>)

    expect(container.querySelector('[data-slot="bubble"]')).not.toHaveClass('rounded-br-sm')
  })

  it('leaves the run of bubbles tight and the turns apart', () => {
    render(
      <BubbleGroup side="in" data-testid="group">
        <Bubble side="in">one</Bubble>
        <Bubble side="in">two</Bubble>
      </BubbleGroup>
    )

    expect(screen.getByTestId('group')).toHaveClass('gap-1')
  })

  it('renders a standalone meta line', () => {
    render(<BubbleMeta>edited</BubbleMeta>)

    expect(screen.getByText('edited')).toBeInTheDocument()
  })
})
