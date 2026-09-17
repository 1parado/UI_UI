import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mentions } from './Mentions'

const team = [
  { key: 'ada', label: 'Ada Lovelace', description: 'Mathematics' },
  { key: 'grace', label: 'Grace Hopper', description: 'Compilers' },
  { key: 'radia', label: 'Radia Perlman', disabled: true },
]

const field = () => screen.getByRole('combobox') as HTMLInputElement
const rows = () => screen.getAllByRole('option')

describe('Mentions', () => {
  it('is a single-line input by default', () => {
    render(<Mentions options={team} />)

    expect(field().tagName).toBe('INPUT')
  })

  it('becomes a textarea when multiline', () => {
    render(<Mentions options={team} multiline rows={5} />)

    expect(field().tagName).toBe('TEXTAREA')
    expect(field()).toHaveAttribute('rows', '5')
  })

  it('opens every name on the trigger alone', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), 'hi @')

    expect(rows().map((row) => row.textContent)).toEqual([
      'Ada LovelaceMathematics',
      'Grace HopperCompilers',
      'Radia Perlman',
    ])
  })

  it('narrows the list as the handle is typed', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@gra')

    expect(rows()).toHaveLength(1)
    expect(screen.getByRole('option', { name: /Grace Hopper/ })).toBeInTheDocument()
  })

  it('does not offer anything mid-word', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), 'mail me@ad')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('completes the handle in place, keeping the rest of the sentence', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Mentions options={team} onSelect={onSelect} />)

    await user.type(field(), 'cc @ad')
    await user.click(screen.getByRole('option', { name: /Ada Lovelace/ }))

    expect(field()).toHaveValue('cc @ada ')
    expect(onSelect).toHaveBeenCalledWith('ada', team[0])
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('leaves the caret after the handle so typing continues', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@ad')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    await user.type(field(), 'look at this')

    expect(field()).toHaveValue('@ada look at this')
  })

  it('accepts with Tab too, so tabbing through a form still works mid-sentence', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@gra')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Tab}')

    expect(field()).toHaveValue('@grace ')
  })

  it('walks around rows it cannot accept', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@a')
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')

    // Radia is the last row and the one that cannot be mentioned.
    expect(field()).not.toHaveValue('@radia ')
  })

  it('closes on Escape without taking the text away', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@gr')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(field()).toHaveValue('@gr')
  })

  it('says so when nobody matches', async () => {
    const user = userEvent.setup()
    render(<Mentions options={team} />)

    await user.type(field(), '@zz')

    expect(await screen.findByText('Nobody by that name')).toBeInTheDocument()
  })

  it('drives its own text when the caller does not own it', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Mentions options={team} onChange={onChange} />)

    await user.type(field(), 'hello')

    expect(onChange).toHaveBeenLastCalledWith('hello')
    expect(field()).toHaveValue('hello')
  })
})
