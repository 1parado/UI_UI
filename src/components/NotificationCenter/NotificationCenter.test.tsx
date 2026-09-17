import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenter, NotificationList } from './NotificationCenter'

const items = [
  { id: '1', title: 'Deploy finished', timestamp: '2m ago' },
  { id: '2', title: 'Build failed', description: 'web · exit 1', timestamp: '1h ago' },
  { id: '3', title: 'Weekly report is ready', timestamp: 'Yesterday', read: true },
]

const bell = () => screen.getByRole('button', { name: 'Notifications' })

describe('NotificationCenter', () => {
  it('counts the unread items on the bell', () => {
    render(<NotificationCenter notifications={items} />)

    expect(bell()).toHaveTextContent('2')
  })

  it('caps the count', () => {
    render(
      <NotificationCenter
        notifications={Array.from({ length: 30 }, (_, index) => ({
          id: String(index),
          title: `Item ${index}`,
        }))}
        maxBadge={9}
      />
    )

    expect(bell()).toHaveTextContent('9+')
  })

  it('hides the badge when everything is read', () => {
    render(
      <NotificationCenter
        notifications={items.map((item) => ({ ...item, read: true }))}
      />
    )

    expect(bell()).not.toHaveTextContent('2')
  })

  it('opens an inbox split into unread and read', async () => {
    const user = userEvent.setup()
    render(<NotificationCenter notifications={items} />)

    await user.click(bell())

    expect(await screen.findByText('Deploy finished')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Earlier')).toBeInTheDocument()
  })

  it('drops the headings when only one group has rows', () => {
    render(<NotificationList notifications={[items[2]]} />)

    expect(screen.queryByText('New')).not.toBeInTheDocument()
    expect(screen.queryByText('Earlier')).not.toBeInTheDocument()
    expect(screen.getByText('Weekly report is ready')).toBeInTheDocument()
  })

  it('keeps the badge in step with the panel', async () => {
    const user = userEvent.setup()
    render(<NotificationCenter notifications={items} />)

    await user.click(bell())
    await user.click(await screen.findByRole('button', { name: /Mark all read/ }))

    // The whole point of the badge: it drops as rows are dealt with.
    expect(bell()).not.toHaveTextContent('2')
  })

  it('disables the bulk action once there is nothing to read', async () => {
    const user = userEvent.setup()
    render(<NotificationCenter notifications={items.map((item) => ({ ...item, read: true }))} />)

    await user.click(bell())

    expect(await screen.findByRole('button', { name: /Mark all read/ })).toBeDisabled()
  })

  it('renders a provided footer', async () => {
    const user = userEvent.setup()
    render(
      <NotificationCenter
        notifications={items}
        footer={<a href="/inbox">View all</a>}
      />
    )

    await user.click(bell())

    expect(await screen.findByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/inbox'
    )
  })
})

describe('NotificationList', () => {
  it('marks a row read when its heading is used', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()
    render(<NotificationList notifications={items} onItemSelect={onItemSelect} />)

    await user.click(screen.getByRole('button', { name: 'Deploy finished' }))

    expect(onItemSelect).toHaveBeenCalledWith(items[0])
    expect(screen.getByRole('button', { name: 'Deploy finished' }).closest('li')).toHaveAttribute(
      'data-read'
    )
  })

  it('reports a selection', async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()
    render(<NotificationList notifications={items} onItemSelect={onItemSelect} />)

    await user.click(screen.getByRole('button', { name: 'Build failed' }))

    expect(onItemSelect).toHaveBeenCalledWith(items[1])
  })

  it('leaves a non-interactive heading out of the tab order', () => {
    render(<NotificationList notifications={[items[2]]} />)

    expect(screen.queryByRole('button', { name: 'Weekly report is ready' })).not.toBeInTheDocument()
    expect(screen.getByText('Weekly report is ready')).toBeInTheDocument()
  })

  it('renders a link when an href is given', () => {
    render(
      <NotificationList
        notifications={[{ id: 'x', title: 'Open the docs', href: '/docs' }]}
      />
    )

    expect(screen.getByRole('link', { name: 'Open the docs' })).toHaveAttribute('href', '/docs')
  })

  it('marks everything read from the header', async () => {
    const user = userEvent.setup()
    const onMarkAllRead = vi.fn()
    render(
      <NotificationList notifications={items} title="Inbox" onMarkAllRead={onMarkAllRead} />
    )

    await user.click(screen.getByRole('button', { name: /Mark all read/ }))

    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    for (const row of rows) expect(row).toHaveAttribute('data-read')
  })

  it('dismisses a row at the row level', async () => {
    const user = userEvent.setup()
    const onItemDismiss = vi.fn()
    render(
      <NotificationList notifications={items} dismissible onItemDismiss={onItemDismiss} />
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss: Deploy finished' }))

    expect(onItemDismiss).toHaveBeenCalledWith(items[0])
    expect(screen.queryByText('Deploy finished')).not.toBeInTheDocument()
  })

  it('shows the empty message when there is nothing', () => {
    render(<NotificationList notifications={[]} />)

    expect(screen.getByText('You are all caught up.')).toBeInTheDocument()
  })

  it('takes a custom empty message', () => {
    render(<NotificationList notifications={[]} emptyMessage="Nothing here." />)

    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })
})
