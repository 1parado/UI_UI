import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Combobox, ComboboxMultiple, type ComboboxOption } from './Combobox'

const models: ComboboxOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o', description: '128k context' },
  { value: 'claude-sonnet', label: 'Claude Sonnet', description: '200k context' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: '1M context' },
  { value: 'legacy', label: 'Legacy model', description: 'retired', disabled: true },
]

describe('Combobox', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<Combobox options={models} placeholder="Choose a model" />)

    expect(
      screen.getByRole('button', { name: /choose a model/i })
    ).toBeInTheDocument()
  })

  it('opens a searchable listbox', async () => {
    const user = userEvent.setup()
    render(<Combobox options={models} />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /GPT-4o/ })).toBeInTheDocument()
  })

  it('filters as the user types', async () => {
    const user = userEvent.setup()
    render(<Combobox options={models} />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))
    await user.type(screen.getByRole('combobox'), 'gemini')

    expect(screen.getByRole('option', { name: /Gemini Pro/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /GPT-4o/ })).not.toBeInTheDocument()
  })

  it('matches on the description too, not just the label', async () => {
    const user = userEvent.setup()
    render(<Combobox options={models} />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))
    await user.type(screen.getByRole('combobox'), '200k')

    expect(screen.getByRole('option', { name: /Claude Sonnet/ })).toBeInTheDocument()
  })

  it('reports the pick and closes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Combobox options={models} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))
    await user.click(screen.getByRole('option', { name: /Claude Sonnet/ }))

    expect(onValueChange).toHaveBeenCalledWith('claude-sonnet')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows the current value on the trigger', () => {
    render(<Combobox options={models} value="gpt-4o" />)

    expect(screen.getByRole('button', { name: /GPT-4o/ })).toBeInTheDocument()
  })

  it('keeps disabled options out of reach', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Combobox options={models} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))
    await user.click(screen.getByRole('option', { name: /Legacy model/ }))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('explains an empty result set', async () => {
    const user = userEvent.setup()
    render(<Combobox options={models} emptyMessage="Nothing matched." />)

    await user.click(screen.getByRole('button', { name: /select an option/i }))
    await user.type(screen.getByRole('combobox'), 'zzz')

    expect(screen.getByText('Nothing matched.')).toBeInTheDocument()
  })

  it('does not open while disabled', async () => {
    const user = userEvent.setup()
    render(<Combobox options={models} disabled placeholder="Locked" />)

    await user.click(screen.getByRole('button', { name: /locked/i }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

describe('ComboboxMultiple', () => {
  it('starts on the placeholder and lists the picks as chips', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <ComboboxMultiple options={models} onValueChange={onValueChange} />
    )

    expect(
      screen.getByRole('button', { name: /select options/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /select options/i }))
    await user.click(screen.getByRole('option', { name: /GPT-4o/ }))

    expect(onValueChange).toHaveBeenCalledWith(['gpt-4o'])

    rerender(
      <ComboboxMultiple
        options={models}
        value={['gpt-4o']}
        onValueChange={onValueChange}
      />
    )
    expect(screen.getByRole('button', { name: /GPT-4o/ })).toBeInTheDocument()
  })

  it('keeps the list open while toggling, and toggles off again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ComboboxMultiple
        options={models}
        value={['gpt-4o']}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /GPT-4o/ }))
    await user.click(screen.getByRole('option', { name: /Claude Sonnet/ }))

    expect(onValueChange).toHaveBeenCalledWith(['gpt-4o', 'claude-sonnet'])
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /GPT-4o/ }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('clears every chip at once', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ComboboxMultiple
        options={models}
        value={['gpt-4o', 'gemini-pro']}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('hides the clear control when nothing is selected', () => {
    render(<ComboboxMultiple options={models} value={[]} />)

    expect(
      screen.queryByRole('button', { name: 'Clear selection' })
    ).not.toBeInTheDocument()
  })
})
