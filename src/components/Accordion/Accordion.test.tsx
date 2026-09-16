import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion'

const items = [
  { value: 'retry', label: 'Retry', body: 'Retry body' },
  { value: 'quota', label: 'Quota', body: 'Quota body' },
]

describe('Accordion', () => {
  it('keeps one section open at a time when type is single', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.label}</AccordionTrigger>
            <AccordionContent>{item.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveAttribute(
      'data-state',
      'open'
    )
    expect(screen.getByText('Retry body')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Quota' }))
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveAttribute(
      'data-state',
      'closed'
    )
    expect(screen.getByRole('button', { name: 'Quota' })).toHaveAttribute(
      'data-state',
      'open'
    )
  })

  it('allows several sections to stay open when type is multiple', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="multiple">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.label}</AccordionTrigger>
            <AccordionContent>{item.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    await user.click(screen.getByRole('button', { name: 'Quota' }))

    expect(screen.getByRole('button', { name: 'Retry' })).toHaveAttribute(
      'data-state',
      'open'
    )
    expect(screen.getByRole('button', { name: 'Quota' })).toHaveAttribute(
      'data-state',
      'open'
    )
  })

  it('labels the panel from its trigger once open', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="retry">
          <AccordionTrigger>Retry</AccordionTrigger>
          <AccordionContent>Retry body</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole('button', { name: 'Retry' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('region', { name: 'Retry' })
    ).toBeInTheDocument()
  })

  it('leaves a disabled trigger inert', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="locked">
          <AccordionTrigger disabled>Locked</AccordionTrigger>
          <AccordionContent>Hidden</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole('button', { name: 'Locked' })
    expect(trigger).toBeDisabled()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })
})
