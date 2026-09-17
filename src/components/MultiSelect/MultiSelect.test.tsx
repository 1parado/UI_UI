import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
  { value: 'd', label: 'Delta', disabled: true },
]

const trigger = (name = 'Pick') => screen.getByRole('button', { name })

describe('MultiSelect', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<MultiSelect options={options} aria-label="Pick" />)

    expect(trigger()).toHaveTextContent('Select options')
  })

  it('shows a chip per selection', () => {
    render(<MultiSelect options={options} defaultValue={['a', 'b']} aria-label="Pick" />)

    expect(trigger()).toHaveTextContent('Alpha')
    expect(trigger()).toHaveTextContent('Beta')
  })

  it('collapses the overflow into a count', () => {
    render(
      <MultiSelect
        options={options}
        defaultValue={['a', 'b', 'c']}
        maxVisibleChips={2}
        aria-label="Pick"
      />
    )

    const button = trigger()
    expect(button).toHaveTextContent('Alpha')
    expect(button).toHaveTextContent('Beta')
    expect(button).not.toHaveTextContent('Gamma')
    expect(button).toHaveTextContent('+1')
  })

  it('toggles an option and keeps the list open', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<MultiSelect options={options} onValueChange={onValueChange} aria-label="Pick" />)

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: 'Beta' }))

    expect(onValueChange).toHaveBeenCalledWith(['b'])
    // A multi-select that closed on every pick would be unusable.
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument()
  })

  it('toggles a selected option back off', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MultiSelect
        options={options}
        defaultValue={['a', 'b']}
        onValueChange={onValueChange}
        aria-label="Pick"
      />
    )

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: 'Beta' }))

    expect(onValueChange).toHaveBeenCalledWith(['a'])
  })

  it('never offers a disabled option', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} aria-label="Pick" />)

    await user.click(trigger())

    expect(await screen.findByRole('option', { name: 'Delta' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('only starts blocking once the ceiling is reached', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelect options={options} defaultValue={['a']} maxSelected={2} aria-label="Pick" />
    )

    await user.click(trigger())

    // One of two taken, so the next pick is still allowed.
    expect(await screen.findByRole('option', { name: 'Gamma' })).toHaveAttribute(
      'aria-disabled',
      'false'
    )

    await user.click(screen.getByRole('option', { name: 'Beta' }))

    // Two of two taken: everything not already chosen locks out.
    expect(screen.getByRole('option', { name: 'Gamma' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('frees an option again when a selection is dropped', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelect options={options} defaultValue={['a', 'b']} maxSelected={2} aria-label="Pick" />
    )

    await user.click(trigger())
    expect(await screen.findByRole('option', { name: 'Gamma' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )

    await user.click(screen.getByRole('option', { name: 'Beta' }))

    expect(screen.getByRole('option', { name: 'Gamma' })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
  })

  it('filters as you type', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} aria-label="Pick" />)

    await user.click(trigger())
    await user.type(screen.getByPlaceholderText('Search…'), 'gam')

    expect(screen.getByRole('option', { name: 'Gamma' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument()
  })

  it('reports when a search matches nothing', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} aria-label="Pick" />)

    await user.click(trigger())
    await user.type(screen.getByPlaceholderText('Search…'), 'zzz')

    expect(screen.getByText('No matches.')).toBeInTheDocument()
  })

  it('selects everything at once, skipping disabled options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<MultiSelect options={options} onValueChange={onValueChange} aria-label="Pick" />)

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: /Select all/ }))

    expect(onValueChange).toHaveBeenCalledWith(['a', 'b', 'c'])
  })

  it('stops select-all at the ceiling', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MultiSelect options={options} maxSelected={2} onValueChange={onValueChange} aria-label="Pick" />
    )

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: /Select all/ }))

    expect(onValueChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('clears everything once all are selected', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MultiSelect
        options={options}
        defaultValue={['a', 'b', 'c']}
        onValueChange={onValueChange}
        aria-label="Pick"
      />
    )

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: /Clear selection/ }))

    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('groups options under a heading', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelect
        options={[
          { value: 'gpt', label: 'GPT-4o', group: 'OpenAI' },
          { value: 'claude', label: 'Claude', group: 'Anthropic' },
        ]}
        aria-label="Pick"
      />
    )

    await user.click(trigger())

    expect(await screen.findByText('OpenAI')).toBeInTheDocument()
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
  })

  it('hides the select-all row when asked', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} selectAll={false} aria-label="Pick" />)

    await user.click(trigger())

    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Select all/ })).not.toBeInTheDocument()
  })

  it('counts the selection in the footer', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={options} defaultValue={['a', 'b']} aria-label="Pick" />)

    await user.click(trigger())

    expect(await screen.findByText('2 selected')).toBeInTheDocument()
  })

  it('warns when the ceiling is reached', async () => {
    const user = userEvent.setup()
    render(
      <MultiSelect options={options} defaultValue={['a', 'b']} maxSelected={2} aria-label="Pick" />
    )

    await user.click(trigger())

    expect(await screen.findByText('Limit reached')).toBeInTheDocument()
  })

  it('does not open when disabled', () => {
    render(<MultiSelect options={options} disabled aria-label="Pick" />)

    expect(trigger()).toBeDisabled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps the clear affordance out of the accessible name', () => {
    render(<MultiSelect options={options} defaultValue={['a']} aria-label="Pick" />)

    const within2 = within(trigger())
    expect(within2.queryByRole('button')).not.toBeInTheDocument()
  })
})
