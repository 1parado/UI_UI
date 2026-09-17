import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Cascader } from './Cascader'
import type { CascaderOption } from '@/lib/cascader'

const options: CascaderOption[] = [
  {
    value: 'zj',
    label: 'Zhejiang',
    children: [
      {
        value: 'hz',
        label: 'Hangzhou',
        children: [
          { value: 'xh', label: 'Xihu' },
          { value: 'gs', label: 'Gongshu' },
        ],
      },
      { value: 'nb', label: 'Ningbo' },
    ],
  },
  {
    value: 'js',
    label: 'Jiangsu',
    children: [{ value: 'nj', label: 'Nanjing', disabled: true }],
  },
]

const trigger = () => screen.getByRole('combobox')

describe('Cascader', () => {
  it('shows a placeholder until something is picked', () => {
    render(<Cascader options={options} aria-label="Region" />)

    expect(trigger()).toHaveTextContent('Select an option')
  })

  it('walks down a branch and only answers on the leaf', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Cascader options={options} onChange={onChange} aria-label="Region" />)

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: 'Zhejiang' }))

    // A parent is a step in the walk, not an answer.
    expect(onChange).not.toHaveBeenCalled()
    expect(await screen.findByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Hangzhou' }))
    await user.click(await screen.findByRole('option', { name: 'Xihu' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(['zj', 'hz', 'xh'])
    expect(trigger()).toHaveTextContent('Zhejiang / Hangzhou / Xihu')
  })

  it('accepts a parent once changeOnSelect is on', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Cascader options={options} onChange={onChange} changeOnSelect aria-label="Region" />
    )

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: 'Zhejiang' }))

    expect(onChange.mock.calls[0][0]).toEqual(['zj'])
    // The branch stays open: a parent answer is rarely the last one.
    expect(screen.getByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()
  })

  it('ignores disabled rows', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Cascader options={options} onChange={onChange} aria-label="Region" />)

    await user.click(trigger())
    await user.click(await screen.findByRole('option', { name: 'Jiangsu' }))
    await user.click(await screen.findByRole('option', { name: 'Nanjing' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('drives the columns from the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Cascader options={options} onChange={onChange} aria-label="Region" />)

    await user.click(trigger())
    const zhejiang = await screen.findByRole('option', { name: 'Zhejiang' })
    zhejiang.focus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Jiangsu' })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: 'Zhejiang' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('option', { name: 'Hangzhou' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('option', { name: 'Zhejiang' })).toHaveFocus()

    // Enter on a folder is another step in the walk, not an answer.
    await user.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('option', { name: 'Hangzhou' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Ningbo' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onChange.mock.calls[0][0]).toEqual(['zj', 'nb'])
  })

  it('clears the picked chain from its trailing button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Cascader
        options={options}
        defaultValue={['zj', 'hz', 'xh']}
        onChange={onChange}
        clearable
        aria-label="Region"
      />
    )

    expect(trigger()).toHaveTextContent('Zhejiang / Hangzhou / Xihu')
    await user.click(screen.getByRole('button', { name: 'Clear selection' }))

    expect(onChange).toHaveBeenCalledWith([], expect.any(Array))
    expect(trigger()).toHaveTextContent('Select an option')
  })

  it('flattens the tree into search hits', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Cascader options={options} onChange={onChange} showSearch aria-label="Region" />
    )

    await user.click(trigger())
    await user.type(screen.getByRole('textbox', { name: 'Search…' }), 'gong')

    await user.click(await screen.findByRole('option', { name: 'Zhejiang / Hangzhou / Gongshu' }))
    expect(onChange.mock.calls[0][0]).toEqual(['zj', 'hz', 'gs'])
  })

  it('reports no matches for a hopeless search', async () => {
    const user = userEvent.setup()
    render(<Cascader options={options} showSearch aria-label="Region" />)

    await user.click(trigger())
    await user.type(screen.getByRole('textbox', { name: 'Search…' }), 'atlantis')

    expect(await screen.findByText('No options')).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
