import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ConfigProvider, useConfig, useConfigSize, useLocale } from './ConfigProvider'
import { zhCN } from '@/lib/config'

function Probe() {
  const config = useConfig()
  const size = useConfigSize()
  const locale = useLocale()

  return (
    <ul>
      <li data-testid="size">{size}</li>
      <li data-testid="search">{locale.search}</li>
      <li data-testid="theme">{config.theme ?? 'unset'}</li>
    </ul>
  )
}

describe('ConfigProvider', () => {
  it('answers library defaults outside any provider', () => {
    render(<Probe />)

    expect(screen.getByTestId('size')).toHaveTextContent('md')
    expect(screen.getByTestId('search')).toHaveTextContent('Search…')
    expect(screen.getByTestId('theme')).toHaveTextContent('unset')
  })

  it('hands its size down', () => {
    render(
      <ConfigProvider size="lg">
        <Probe />
      </ConfigProvider>
    )

    expect(screen.getByTestId('size')).toHaveTextContent('lg')
  })

  it('lets a nested provider inherit what it did not set', () => {
    render(
      <ConfigProvider size="sm">
        <ConfigProvider locale={{ search: 'Find…' }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>
    )

    expect(screen.getByTestId('size')).toHaveTextContent('sm')
    expect(screen.getByTestId('search')).toHaveTextContent('Find…')
  })

  it('merges a partial locale over the inherited one', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <ConfigProvider locale={{ search: 'Find…' }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>
    )

    // The overridden word changed; the rest of the inherited dictionary stayed.
    expect(screen.getByTestId('search')).toHaveTextContent('Find…')
    expect(screen.getByTestId('size')).toHaveTextContent('md')
  })

  it('puts dark mode on the document, not on a wrapper', async () => {
    const { unmount } = render(
      <ConfigProvider theme="dark">
        <Probe />
      </ConfigProvider>
    )

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    unmount()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('restores whatever was there before it arrived', async () => {
    document.documentElement.classList.add('dark')
    const { unmount } = render(
      <ConfigProvider theme="light">
        <Probe />
      </ConfigProvider>
    )

    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
    unmount()
    expect(document.documentElement).toHaveClass('dark')
    document.documentElement.classList.remove('dark')
  })

  it('follows the system when asked, which here means light', async () => {
    render(
      <ConfigProvider theme="system">
        <Probe />
      </ConfigProvider>
    )

    // The test environment reports no preference, so nothing is inverted.
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('adds a wrapper only when there is something to carry', () => {
    const { container } = render(
      <ConfigProvider size="md">
        <span>plain</span>
      </ConfigProvider>
    )

    expect(container.firstElementChild?.tagName).toBe('SPAN')
  })

  it('sets direction on that wrapper', () => {
    const { container } = render(
      <ConfigProvider direction="rtl">
        <span>plain</span>
      </ConfigProvider>
    )

    expect(container.firstElementChild).toHaveAttribute('dir', 'rtl')
  })
})
