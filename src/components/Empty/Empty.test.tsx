import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Empty, EmptyDescription, EmptyTitle } from './Empty'
import { EmptyIllustration } from './EmptyIllustration'
import { emptyPresets, type EmptyPreset } from '@/lib/empty'

const presets = Object.keys(emptyPresets) as EmptyPreset[]

describe('Empty', () => {
  it('holds a title, a description and an action', () => {
    render(
      <Empty>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create your first one to get started.</EmptyDescription>
        <button type="button">Create project</button>
      </Empty>
    )

    expect(screen.getByRole('heading', { name: 'No projects yet' })).toBeInTheDocument()
    expect(screen.getByText('Create your first one to get started.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create project' })).toBeInTheDocument()
  })
})

describe('EmptyIllustration', () => {
  it('draws something for every preset', () => {
    for (const preset of presets) {
      const { unmount } = render(<EmptyIllustration name={preset} />)

      const drawing = document.querySelector('svg')
      expect(drawing).toBeInTheDocument()
      expect(drawing?.childElementCount).toBeGreaterThan(0)

      unmount()
    }
  })

  it('stays out of the accessibility tree by default', () => {
    render(<EmptyIllustration name="inbox" />)

    expect(document.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('becomes a labelled image when it has something to say', () => {
    render(<EmptyIllustration name="error" label="An error occurred" />)

    expect(screen.getByRole('img', { name: 'An error occurred' })).toBeInTheDocument()
  })
})
