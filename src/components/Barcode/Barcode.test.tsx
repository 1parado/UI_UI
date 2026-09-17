import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Barcode } from './Barcode'

const bars = () => document.querySelectorAll('svg rect')

describe('Barcode', () => {
  it('draws bars rather than an image, and labels the picture', () => {
    render(<Barcode value="SF-2026-0042" />)

    expect(bars().length).toBeGreaterThan(10)
    expect(screen.getByRole('img')).toHaveAccessibleName('SF-2026-0042')
  })

  it('takes a custom description', () => {
    render(<Barcode value="SF-2026-0042" label="Shipping label" />)

    expect(screen.getByRole('img')).toHaveAccessibleName('Shipping label')
  })

  it('prints the value under the bars by default', () => {
    render(<Barcode value="SF-2026-0042" />)

    expect(screen.getByText('SF-2026-0042')).toBeInTheDocument()
  })

  it('can leave the value out', () => {
    render(<Barcode value="SF-2026-0042" showText={false} />)

    expect(screen.queryByText('SF-2026-0042')).not.toBeInTheDocument()
    expect(bars().length).toBeGreaterThan(10)
  })

  it('draws a narrower code for numbers than for letters', () => {
    const { unmount } = render(<Barcode value="12345678" />)
    const numeric = Number(bars().length)
    unmount()

    render(<Barcode value="ABCDEFGH" />)
    const alphabetic = Number(bars().length)

    // Code C packs two digits into one symbol, so eight digits cost fewer
    // symbols than eight letters.
    expect(numeric).toBeLessThan(alphabetic)
  })

  it('refuses to fake a code it cannot encode', () => {
    render(<Barcode value="中央" />)

    expect(screen.getByText('Not encodable as Code 128')).toBeInTheDocument()
    expect(bars()).toHaveLength(0)
  })

  it('keeps the quiet zone around the symbol', () => {
    render(<Barcode value="SF-1" />)

    const first = document.querySelector('svg rect')
    // Ten modules of nothing before the first bar, whatever the module width.
    expect(Number(first?.getAttribute('x'))).toBe(10)
  })
})
