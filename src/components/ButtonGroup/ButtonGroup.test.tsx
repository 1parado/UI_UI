import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ButtonGroup, ButtonGroupSeparator } from './ButtonGroup'
import { Button } from '@/components/Button'

describe('ButtonGroup', () => {
  it('exposes the group to assistive tech and defaults to horizontal', () => {
    render(
      <ButtonGroup aria-label="View mode">
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
    )

    const group = screen.getByRole('group', { name: 'View mode' })
    expect(group).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('drops the inner radii so the members read as one control', () => {
    render(
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
    )

    const group = screen.getByRole('group')
    expect(group.className).toContain('[&>*:not(:first-child)]:rounded-l-none')
    expect(group.className).toContain('[&>*:not(:last-child)]:rounded-r-none')
  })

  it('switches the collapsing axis for a vertical group', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Up</Button>
        <Button variant="outline">Down</Button>
      </ButtonGroup>
    )

    const group = screen.getByRole('group')
    expect(group).toHaveAttribute('data-orientation', 'vertical')
    expect(group.className).toContain('[&>*:not(:first-child)]:-mt-px')
    expect(group.className).toContain('[&>*:not(:first-child)]:rounded-t-none')
  })

  it('renders a separator that reports its orientation', () => {
    render(
      <ButtonGroup>
        <Button>Approve</Button>
        <ButtonGroupSeparator />
        <Button variant="destructive">Delete</Button>
      </ButtonGroup>
    )

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical'
    )
  })

  it('keeps each member individually focusable', async () => {
    const user = userEvent.setup()

    render(
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Day' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Week' })).toHaveFocus()
  })
})
