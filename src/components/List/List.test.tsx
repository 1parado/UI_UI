import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  List,
  ListDescription,
  ListHeader,
  ListItem,
  ListItemActions,
  ListItemContent,
  ListTitle,
} from './List'

const members = [
  { id: 'a', name: 'Ada Lovelace', role: 'Mathematics' },
  { id: 'b', name: 'Barbara Liskov', role: 'Languages' },
]

const row = (member: (typeof members)[number]) => (
  <ListItem interactive>
    <ListItemContent>
      <ListTitle>{member.name}</ListTitle>
      <ListDescription>{member.role}</ListDescription>
    </ListItemContent>
    <ListItemActions>
      <button type="button">Remove</button>
    </ListItemActions>
  </ListItem>
)

describe('List', () => {
  it('renders one row per item', () => {
    render(<List items={members} keyOf={(member) => member.id} renderItem={row} />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Barbara Liskov')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('takes rows as children just as happily', () => {
    render(
      <List>
        <ListItem>First</ListItem>
        <ListItem>Second</ListItem>
      </List>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('falls back to the index when no key is given', () => {
    render(<List items={members} renderItem={(member) => <ListItem>{member.name}</ListItem>} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('keeps its header and footer outside the row list', () => {
    render(
      <List
        items={members}
        keyOf={(member) => member.id}
        renderItem={row}
        header={
          <ListHeader>
            <ListTitle>Team</ListTitle>
          </ListHeader>
        }
        footer={<button type="button">Add member</button>}
      />
    )

    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add member' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows its empty state when there is nothing to list', () => {
    render(<List items={[]} renderItem={row} />)

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('lets the caller draw the empty state', () => {
    render(<List empty={<button type="button">Invite people</button>} />)

    expect(screen.getByRole('button', { name: 'Invite people' })).toBeInTheDocument()
  })

  it('draws skeleton rows while loading rather than claiming to be empty', () => {
    render(<List items={[]} loading skeletonCount={4} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.queryByText('Nothing here yet')).not.toBeInTheDocument()
  })

  it('draws divider lines between rows only when asked', () => {
    const { container, rerender } = render(
      <List>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>
    )

    const dividedClass = '[&>ul>li+li]:border-t'
    expect(container.firstElementChild?.className).not.toContain(dividedClass)

    rerender(
      <List divided>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>
    )
    expect(container.firstElementChild?.className).toContain(dividedClass)
  })

  it('carries interaction on the row itself', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <List>
        <ListItem interactive onClick={onClick}>
          Pick me
        </ListItem>
      </List>
    )

    await user.click(screen.getByText('Pick me'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks selection and disability for styling and AT', () => {
    render(
      <List>
        <ListItem selected>Chosen</ListItem>
        <ListItem disabled>Unavailable</ListItem>
      </List>
    )

    expect(screen.getByText('Chosen')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByText('Unavailable')).toHaveAttribute('data-disabled', 'true')
  })
})
