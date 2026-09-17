import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AutoComplete } from './AutoComplete'

const options = [
  'main',
  'master',
  'develop',
  { value: 'release/1.0', label: 'release/1.0' },
  { value: 'legacy', label: 'legacy', disabled: true },
]

const field = () => screen.getByRole('combobox')
const optionsInList = () => screen.getAllByRole('option')

describe('AutoComplete', () => {
  it('offers suggestions once typing starts', async () => {
    const user = userEvent.setup()
    render(<AutoComplete options={options} />)

    await user.type(field(), 'ma')

    expect(optionsInList().map((row) => row.textContent)).toEqual(['main', 'master'])
  })

  it('accepts what was typed as a value in its own right', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AutoComplete options={options} onChange={onChange} />)

    await user.type(field(), 'no-such-branch')

    expect(field()).toHaveValue('no-such-branch')
    expect(onChange).toHaveBeenCalledWith('no-such-branch')
    expect(await screen.findByText('No matches')).toBeInTheDocument()
  })

  it('fills the field from a clicked suggestion', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AutoComplete options={options} onSelect={onSelect} />)

    await user.type(field(), 'deve')
    await user.click(screen.getByRole('option', { name: 'develop' }))

    expect(field()).toHaveValue('develop')
    expect(onSelect).toHaveBeenCalledWith('develop', { value: 'develop' })
  })

  it('keeps focus in the field so typing can continue', async () => {
    const user = userEvent.setup()
    render(<AutoComplete options={options} />)

    await user.type(field(), 'ma')
    expect(field()).toHaveFocus()
  })

  it('drives the list from the keyboard', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AutoComplete options={options} onSelect={onSelect} />)

    await user.click(field())
    await user.type(field(), 'ma')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'master' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('master', { value: 'master' })
  })

  it('steps over rows it cannot accept', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<AutoComplete options={options} onSelect={onSelect} />)

    await user.type(field(), 'e')
    // Every row but `legacy` matches; the disabled one is skipped either way.
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')

    const accepted = onSelect.mock.calls[0]?.[0]
    expect(accepted).not.toBe('legacy')
  })

  it('closes on Escape and leaves the text alone', async () => {
    const user = userEvent.setup()
    render(<AutoComplete options={options} />)

    await user.type(field(), 'ma')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(field()).toHaveValue('ma')
  })

  it('shows every suggestion the moment focus lands, when asked', async () => {
    const user = userEvent.setup()
    render(<AutoComplete options={options} openOnFocus />)

    await user.click(field())

    expect(optionsInList()).toHaveLength(5)
  })

  it('does not open on focus unless asked', async () => {
    const user = userEvent.setup()
    render(<AutoComplete options={options} />)

    await user.click(field())

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears the field from its trailing button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <AutoComplete options={options} defaultValue="main" onChange={onChange} clearable />
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(field()).toHaveValue('')
    expect(onChange).toHaveBeenCalledWith('')
  })
})
