import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Descriptions, DescriptionsItem } from './Descriptions'

describe('Descriptions', () => {
  it('pairs a label with its value', () => {
    render(
      <Descriptions>
        <DescriptionsItem label="Status">Running</DescriptionsItem>
      </Descriptions>
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('drives the column count through a CSS variable', () => {
    const { container } = render(
      <Descriptions columns={3}>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>
    )

    // The count is geometry, so it lives in a variable rather than a class and
    // can be any number at runtime.
    expect(container.querySelector('dl')).toHaveAttribute(
      'style',
      expect.stringContaining('--descriptions-columns: 3')
    )
  })

  it('defaults to a single column', () => {
    const { container } = render(
      <Descriptions>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>
    )

    expect(container.querySelector('dl')).toHaveAttribute(
      'style',
      expect.stringContaining('--descriptions-columns: 1')
    )
  })

  it('records the orientation it was given', () => {
    const { container } = render(
      <Descriptions orientation="horizontal">
        <DescriptionsItem label="Plan">Team</DescriptionsItem>
      </Descriptions>
    )

    expect(container.querySelector('dl')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('lets an entry span the full width', () => {
    const { container } = render(
      <Descriptions columns={2}>
        <DescriptionsItem label="Request id" span>
          req_01
        </DescriptionsItem>
      </Descriptions>
    )

    expect(container.querySelector('[data-slot="descriptions-item"]')).toHaveClass(
      'col-span-full'
    )
  })

  it('takes nodes as values', () => {
    render(
      <Descriptions>
        <DescriptionsItem label="Status">
          <span data-testid="badge">Healthy</span>
        </DescriptionsItem>
      </Descriptions>
    )

    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('uses definition-list markup', () => {
    const { container } = render(
      <Descriptions>
        <DescriptionsItem label="Region">ap-guangzhou</DescriptionsItem>
      </Descriptions>
    )

    expect(container.querySelector('dl dt')).toHaveTextContent('Region')
    expect(container.querySelector('dl dd')).toHaveTextContent('ap-guangzhou')
  })
})
