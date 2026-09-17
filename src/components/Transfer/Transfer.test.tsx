import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Transfer } from './Transfer'
import type { TransferItem } from '@/lib/transfer'

const people: TransferItem[] = [
  { key: 'a', title: 'Ada Lovelace', description: 'Mathematics' },
  { key: 'b', title: 'Barbara Liskov', description: 'Languages' },
  { key: 'c', title: 'Grace Hopper', description: 'Compilers', disabled: true },
  { key: 'd', title: 'Radia Perlman', description: 'Networks' },
]

const row = (name: string) => screen.getByRole('checkbox', { name })

describe('Transfer', () => {
  it('splits rows across the two panels', () => {
    render(<Transfer dataSource={people} defaultTargetKeys={['b']} />)

    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(row('Ada Lovelace')).toBeInTheDocument()
    expect(row('Barbara Liskov')).toBeInTheDocument()
  })

  it('moves a ticked row to the target and reports the batch', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Transfer dataSource={people} onChange={onChange} />)

    await user.click(row('Ada Lovelace'))
    await user.click(screen.getByRole('button', { name: 'Move selected to target' }))

    expect(onChange).toHaveBeenCalledWith(['a'], 'to-target', ['a'])
    // Uncontrolled, so the row really does walk across.
    expect(row('Ada Lovelace')).toBeInTheDocument()
  })

  it('moves rows back', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Transfer dataSource={people} defaultTargetKeys={['a', 'd']} onChange={onChange} />)

    await user.click(row('Radia Perlman'))
    await user.click(screen.getByRole('button', { name: 'Move selected to source' }))

    expect(onChange).toHaveBeenCalledWith(['a'], 'to-source', ['d'])
  })

  it('keeps both move buttons parked until a row is ticked', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} defaultTargetKeys={['d']} />)

    expect(screen.getByRole('button', { name: 'Move selected to target' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move selected to source' })).toBeDisabled()

    await user.click(row('Ada Lovelace'))
    expect(screen.getByRole('button', { name: 'Move selected to target' })).toBeEnabled()

    await user.click(row('Radia Perlman'))
    expect(screen.getByRole('button', { name: 'Move selected to source' })).toBeEnabled()
  })

  it('clears the ticks it just moved', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} />)

    await user.click(row('Ada Lovelace'))
    await user.click(screen.getByRole('button', { name: 'Move selected to target' }))

    expect(row('Ada Lovelace')).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Move selected to target' })).toBeDisabled()
  })

  it('never lets a disabled row move', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Transfer dataSource={people} onChange={onChange} />)

    expect(row('Grace Hopper')).toBeDisabled()
    await user.click(row('Grace Hopper'))
    expect(row('Grace Hopper')).not.toBeChecked()
  })

  it('ticks and unticks one whole panel', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} defaultTargetKeys={['d']} />)

    await user.click(screen.getByRole('checkbox', { name: 'Select all rows in Source' }))
    expect(row('Ada Lovelace')).toBeChecked()
    expect(row('Barbara Liskov')).toBeChecked()
    // Disabled rows are not tickable, so they are not ticked.
    expect(row('Grace Hopper')).not.toBeChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Select all rows in Source' }))
    expect(row('Ada Lovelace')).not.toBeChecked()
  })

  it('filters each panel on its own', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} defaultTargetKeys={['d']} />)

    await user.type(screen.getAllByRole('textbox', { name: 'Search…' })[0], 'compilers')

    expect(row('Grace Hopper')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Ada Lovelace' })).not.toBeInTheDocument()
    // The other panel keeps showing everything.
    expect(row('Radia Perlman')).toBeInTheDocument()
  })

  it('says when a filtered panel is empty', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} defaultTargetKeys={['d']} />)

    await user.type(screen.getAllByRole('textbox', { name: 'Search…' })[0], 'atlantis')

    expect(await screen.findByText('Nothing here')).toBeInTheDocument()
  })

  it('counts ticked rows under each heading', async () => {
    const user = userEvent.setup()
    render(<Transfer dataSource={people} />)

    await user.click(row('Ada Lovelace'))

    expect(screen.getByText('1/4')).toBeInTheDocument()
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })
})
