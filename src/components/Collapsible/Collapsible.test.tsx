import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible'
import { Button } from '../Button'

describe('Collapsible', () => {
  it('toggles its content from the built-in trigger', async () => {
    const user = userEvent.setup()
    render(
      <Collapsible>
        <CollapsibleTrigger>More details</CollapsibleTrigger>
        <CollapsibleContent>The hidden body</CollapsibleContent>
      </Collapsible>
    )

    expect(screen.queryByText('The hidden body')).toBeNull()

    await user.click(screen.getByRole('button', { name: /More details/ }))
    expect(screen.getByText('The hidden body')).toBeVisible()
  })

  it('slots onto a Button with several children when asChild is set', async () => {
    // Regression: the chevron used to be appended unconditionally, so the
    // Slot here received two children and threw during render.
    const user = userEvent.setup()
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Key innovations</span>
            <span aria-hidden="true">+</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>Opened body</CollapsibleContent>
      </Collapsible>
    )

    const trigger = screen.getByRole('button', { name: /Key innovations/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Opened body')).toBeVisible()
  })

  it('keeps the trailing chevron when no asChild is involved', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Built-in look</CollapsibleTrigger>
      </Collapsible>
    )

    const trigger = screen.getByRole('button', { name: /Built-in look/ })
    expect(trigger.querySelector('svg')).not.toBeNull()
  })

  it('forwards onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      </Collapsible>
    )

    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})
