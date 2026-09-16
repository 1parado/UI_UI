import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Blockquote,
  Heading,
  InlineCode,
  Small,
  Text,
} from './Typography'

describe('Typography', () => {
  it('maps the heading level to both tag and scale', () => {
    render(
      <>
        <Heading level={1}>A</Heading>
        <Heading level={3}>B</Heading>
      </>
    )

    const h1 = screen.getByRole('heading', { level: 1, name: 'A' })
    expect(h1.tagName).toBe('H1')
    expect(h1.className).toContain('text-4xl')

    const h3 = screen.getByRole('heading', { level: 3, name: 'B' })
    expect(h3.tagName).toBe('H3')
    expect(h3.className).toContain('text-2xl')
  })

  it('defaults to a level-1 heading', () => {
    render(<Heading>Title</Heading>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('applies the requested text variant', () => {
    render(
      <>
        <Text>Body</Text>
        <Text variant="muted">Aside</Text>
        <Text variant="lead">Intro</Text>
      </>
    )

    expect(screen.getByText('Body').className).toContain('text-foreground')
    expect(screen.getByText('Aside').className).toContain('text-muted-foreground')
    expect(screen.getByText('Intro').className).toContain('text-xl')
  })

  it('renders Text as the element named by `as`', () => {
    render(<Text as="span">Inline</Text>)
    expect(screen.getByText('Inline').tagName).toBe('SPAN')
  })

  it('keeps semantic tags for the small parts', () => {
    render(
      <>
        <Small>Updated today</Small>
        <Blockquote>Restraint over decoration.</Blockquote>
        <InlineCode>pnpm install</InlineCode>
      </>
    )

    expect(screen.getByText('Updated today').tagName).toBe('SMALL')
    expect(screen.getByText('Restraint over decoration.').tagName).toBe(
      'BLOCKQUOTE'
    )
    expect(screen.getByText('pnpm install').tagName).toBe('CODE')
  })
})
