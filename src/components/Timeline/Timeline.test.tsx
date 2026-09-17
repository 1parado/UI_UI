import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timeline, TimelineItem } from './Timeline'

describe('Timeline', () => {
  it('renders each entry as a list item', () => {
    render(
      <Timeline>
        <TimelineItem title="Opened" />
        <TimelineItem title="Merged" />
      </Timeline>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Opened')).toBeInTheDocument()
    expect(screen.getByText('Merged')).toBeInTheDocument()
  })

  it('renders title, timestamp and description together', () => {
    render(
      <Timeline>
        <TimelineItem title="Ran CI" description="typecheck, lint, test" timestamp="09:44" />
      </Timeline>
    )

    expect(screen.getByText('Ran CI')).toBeInTheDocument()
    expect(screen.getByText('typecheck, lint, test')).toBeInTheDocument()
    expect(screen.getByText('09:44')).toBeInTheDocument()
  })

  it('exposes the status it was given', () => {
    render(
      <Timeline>
        <TimelineItem title="Failed" status="destructive" />
      </Timeline>
    )

    expect(screen.getByRole('listitem')).toHaveAttribute('data-status', 'destructive')
  })

  it('replaces the dot with a custom marker', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Step" icon={<span data-testid="marker">1</span>} />
      </Timeline>
    )

    expect(container.querySelector('[data-testid="marker"]')).toBeInTheDocument()
  })

  it('draws a connector on every entry, hidden by CSS on the last', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="First" />
        <TimelineItem title="Second" />
      </Timeline>
    )

    // The connector stays in the DOM and is hidden with a `last-child` rule, so
    // that a trailing gap never leaves space under the final entry.
    expect(container.querySelectorAll('[data-timeline-line]')).toHaveLength(2)
  })

  it('accepts arbitrary content inside an entry', () => {
    render(
      <Timeline>
        <TimelineItem title="Deploy">
          <p>pnpm build</p>
        </TimelineItem>
      </Timeline>
    )

    expect(screen.getByText('pnpm build')).toBeInTheDocument()
  })
})
