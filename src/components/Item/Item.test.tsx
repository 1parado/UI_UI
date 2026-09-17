import type * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './Item'

const row = (label: string, extra?: React.ReactNode) => (
  <Item>
    <ItemMedia variant="icon" data-testid={`media-${label}`} />
    <ItemContent>
      <ItemTitle>{label}</ItemTitle>
      <ItemDescription>Updated today</ItemDescription>
    </ItemContent>
    {extra}
  </Item>
)

describe('Item', () => {
  it('lays out media, content and actions', () => {
    render(<ItemGroup>{row('Atlas')}</ItemGroup>)

    expect(screen.getByText('Atlas')).toHaveAttribute('data-slot', 'item-title')
    expect(screen.getByText('Updated today')).toHaveAttribute('data-slot', 'item-description')
    expect(screen.getByTestId('media-Atlas')).toHaveAttribute('data-slot', 'item-media')
  })

  it('renders the child element when asChild is set', () => {
    render(
      <ItemGroup>
        <Item asChild interactive>
          <a href="/projects/atlas">
            <ItemContent>
              <ItemTitle>Atlas</ItemTitle>
            </ItemContent>
          </a>
        </Item>
      </ItemGroup>
    )

    // One control, not a div wrapping a link — the row itself is the anchor.
    const link = screen.getByRole('link', { name: 'Atlas' })
    expect(link).toHaveAttribute('data-slot', 'item')
    expect(link).toHaveClass('cursor-pointer')
  })

  it('marks the selected row', () => {
    render(
      <ItemGroup>
        <Item selected>
          <ItemContent>
            <ItemTitle>Chosen</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    )

    expect(screen.getByText('Chosen').closest('[data-slot="item"]')).toHaveAttribute(
      'data-selected',
      'true'
    )
  })

  it('keeps actions as a sibling of the text column', () => {
    render(
      <ItemGroup>
        {row(
          'Atlas',
          <ItemActions>
            <button type="button">Open</button>
          </ItemActions>
        )}
      </ItemGroup>
    )

    expect(screen.getByRole('button', { name: 'Open' }).parentElement).toHaveAttribute(
      'data-slot',
      'item-actions'
    )
  })

  it('renders a separator that reads as one to assistive tech', () => {
    render(
      <ItemGroup>
        <ItemSeparator />
      </ItemGroup>
    )

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('divides rows in the default variant and spaces them in plain', () => {
    const { container: divided } = render(<ItemGroup>{row('A')}</ItemGroup>)
    expect(divided.firstElementChild).toHaveClass('divide-y')

    const { container: plain } = render(<ItemGroup variant="plain">{row('A')}</ItemGroup>)
    expect(plain.firstElementChild).not.toHaveClass('divide-y')
  })
})
