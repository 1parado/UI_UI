import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './Command'

const renderCommand = (onSelect = vi.fn()) => {
  render(
    <Command>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Conversations">
          <CommandItem onSelect={() => onSelect('retry-401')}>
            Why does retry return 401?
          </CommandItem>
          <CommandItem onSelect={() => onSelect('tokens')}>
            Token accounting
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )

  return onSelect
}

describe('Command', () => {
  it('filters items as the user types', async () => {
    const user = userEvent.setup()
    renderCommand()

    expect(screen.getByText('Token accounting')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Search…'), 'token')

    expect(screen.getByText('Token accounting')).toBeInTheDocument()
    expect(
      screen.queryByText('Why does retry return 401?')
    ).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderCommand()

    await user.type(screen.getByPlaceholderText('Search…'), 'zzzz')

    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('selects the highlighted item on Enter', async () => {
    const user = userEvent.setup()
    const onSelect = renderCommand()

    await user.click(screen.getByPlaceholderText('Search…'))
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith('retry-401')
  })

  it('moves the highlight with the arrow keys', async () => {
    const user = userEvent.setup()
    const onSelect = renderCommand()

    await user.click(screen.getByPlaceholderText('Search…'))
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith('tokens')
  })

  it('never selects a disabled item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem disabled onSelect={() => onSelect('locked')}>
              Delete workspace
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    await user.click(screen.getByPlaceholderText('Search…'))
    await user.keyboard('{Enter}')

    expect(onSelect).not.toHaveBeenCalled()
  })
})
