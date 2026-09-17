import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Result } from './Result'

describe('Result', () => {
  it('puts the outcome in the markup, not only in the colour', () => {
    render(<Result status="success" title="Payment received" />)

    expect(document.querySelector('[data-slot="result"]')).toHaveAttribute(
      'data-status',
      'success'
    )
  })

  it('renders the title as a heading so it can be jumped to', () => {
    render(<Result status="error" title="Something went wrong" />)

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument()
  })

  it('shows the explanation when there is one', () => {
    render(<Result status="info" title="Heads up" subTitle="Nothing was saved." />)

    expect(screen.getByText('Nothing was saved.')).toBeInTheDocument()
  })

  it('leaves the subtitle out rather than rendering an empty paragraph', () => {
    const { container } = render(<Result status="info" title="Heads up" />)

    expect(container.querySelector('[data-slot="result-subtitle"]')).toBeNull()
  })

  it('keeps the actions in their own row', () => {
    render(
      <Result
        status="success"
        title="Done"
        extra={<button>Back to dashboard</button>}
      />
    )

    expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeInTheDocument()
  })

  it('takes a custom icon for the outcomes the presets do not cover', () => {
    render(<Result status="info" title="Custom" icon={<span data-testid="own" />} />)

    expect(screen.getByTestId('own')).toBeInTheDocument()
  })

  it('hides the decorative icon from assistive technology', () => {
    const { container } = render(<Result status="warning" title="Careful" />)

    const icon = container.querySelector('[data-slot="result-icon"] svg')
    expect(icon).toHaveAttribute('aria-hidden')
  })

  it('renders extra content between the text and the actions', () => {
    render(
      <Result status="error" title="Failed" extra={<button>Retry</button>}>
        <p>The upstream service timed out.</p>
      </Result>
    )

    expect(screen.getByText('The upstream service timed out.')).toBeInTheDocument()
  })
})
