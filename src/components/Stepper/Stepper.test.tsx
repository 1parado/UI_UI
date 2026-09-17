import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stepper, StepperItem } from './Stepper'

const ThreeSteps = ({ current }: { current: number }) => (
  <Stepper current={current}>
    <StepperItem title="Account" />
    <StepperItem title="Workspace" />
    <StepperItem title="Invite" />
  </Stepper>
)

describe('Stepper', () => {
  it('derives each step state from current', () => {
    render(<ThreeSteps current={1} />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-state', 'completed')
    expect(items[1]).toHaveAttribute('data-state', 'current')
    expect(items[2]).toHaveAttribute('data-state', 'upcoming')
  })

  it('marks the active step for assistive tech', () => {
    render(<ThreeSteps current={2} />)

    const items = screen.getAllByRole('listitem')
    expect(items[1]).not.toHaveAttribute('aria-current')
    expect(items[2]).toHaveAttribute('aria-current', 'step')
  })

  it('swaps the number for a tick once a step is done', () => {
    render(<ThreeSteps current={1} />)

    const items = screen.getAllByRole('listitem')
    // Completed steps render an icon; pending ones render their number.
    expect(items[0].querySelector('svg')).toBeInTheDocument()
    expect(items[1].querySelector('svg')).not.toBeInTheDocument()
    expect(items[1]).toHaveTextContent('2')
  })

  it('lets a step override its own state', () => {
    render(
      <Stepper current={1}>
        <StepperItem title="Account" />
        <StepperItem title="Workspace" status="error" />
      </Stepper>
    )

    expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('data-state', 'error')
  })

  it('omits the connector on the final step', () => {
    render(<ThreeSteps current={0} />)

    const items = screen.getAllByRole('listitem')
    expect(items[0].querySelectorAll('[aria-hidden]')).toHaveLength(1)
    expect(items[2].querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })

  it('renders vertically when asked', () => {
    render(
      <Stepper current={0} orientation="vertical">
        <StepperItem title="Connect repository" />
      </Stepper>
    )

    expect(screen.getByRole('list')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders a description under the title', () => {
    render(
      <Stepper current={0}>
        <StepperItem title="Account" description="Email and password" />
      </Stepper>
    )

    expect(screen.getByText('Email and password')).toBeInTheDocument()
  })

  it('positions steps by their order in the markup', () => {
    // Inserting a step in the middle shifts everything after it without any
    // index bookkeeping.
    render(
      <Stepper current={1}>
        <StepperItem title="Account" />
        <StepperItem title="Billing" />
        <StepperItem title="Workspace" />
      </Stepper>
    )

    const items = screen.getAllByRole('listitem')
    expect(items[1]).toHaveTextContent('Billing')
    expect(items[1]).toHaveAttribute('data-state', 'current')
    expect(items[2]).toHaveAttribute('data-state', 'upcoming')
  })
})
