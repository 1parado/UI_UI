import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Line, LineChart, XAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, chartPalette } from './Chart'

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
]

const config = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
}

describe('chartPalette', () => {
  it('has five slots', () => {
    expect(chartPalette).toHaveLength(5)
    expect(chartPalette[0]).toBe('var(--chart-1)')
  })
})

describe('ChartContainer', () => {
  it('turns the config into series variables', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config}>
        <LineChart data={data}>
          <Line dataKey="desktop" />
        </LineChart>
      </ChartContainer>
    )

    const box = container.firstElementChild as HTMLElement
    expect(box.style.getPropertyValue('--color-desktop')).toBe('var(--chart-1)')
    expect(box.style.getPropertyValue('--color-mobile')).toBe('var(--chart-2)')
  })

  it('gives an uncoloured series the next slot', () => {
    const { container } = render(
      <ChartContainer
        width={400}
        height={300}
        config={{ desktop: { label: 'Desktop' }, mobile: { label: 'Mobile' } }}
      >
        <LineChart data={data}>
          <Line dataKey="desktop" />
        </LineChart>
      </ChartContainer>
    )

    const box = container.firstElementChild as HTMLElement
    expect(box.style.getPropertyValue('--color-desktop')).toBe('var(--chart-1)')
    expect(box.style.getPropertyValue('--color-mobile')).toBe('var(--chart-2)')
  })

  it('draws the chart at a fixed size', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <Line dataKey="desktop" />
        </LineChart>
      </ChartContainer>
    )

    // A fixed size is what makes the chart render outside a browser: a
    // responsive container in an unsized parent measures 0 and draws nothing.
    expect(container.querySelector('.recharts-surface')).not.toBeNull()
    expect(container.querySelector('.recharts-wrapper')).toHaveStyle({ width: '400px' })
  })

  it('shows the empty slot instead of a chart', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config} isEmpty empty="No data yet">
        <LineChart data={[]}>
          <Line dataKey="desktop" />
        </LineChart>
      </ChartContainer>
    )

    expect(screen.getByText('No data yet')).toBeInTheDocument()
    expect(container.querySelector('.recharts-surface')).toBeNull()
  })

  it('marks itself for consumer styling', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config}>
        <LineChart data={data}>
          <Line dataKey="desktop" />
        </LineChart>
      </ChartContainer>
    )

    expect(container.firstElementChild).toHaveAttribute('data-chart')
  })
})

describe('ChartTooltipContent', () => {
  it('renders nothing until there is something to show', () => {
    const { container } = render(<ChartTooltipContent config={config} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('labels each series from the config', () => {
    render(
      <ChartTooltipContent
        config={config}
        active
        label="Jan"
        payload={[{ dataKey: 'desktop', value: 186, name: 'desktop' }]}
      />
    )

    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
    expect(screen.getByText('186')).toBeInTheDocument()
  })

  it('falls back to the series key when the config does not name it', () => {
    render(
      <ChartTooltipContent active payload={[{ dataKey: 'visitors', value: 12 }]} />
    )

    expect(screen.getByText('visitors')).toBeInTheDocument()
  })

  it('can hide the label and the indicator', () => {
    const { container } = render(
      <ChartTooltipContent
        config={config}
        active
        label="Jan"
        hideLabel
        hideIndicator
        payload={[{ dataKey: 'desktop', value: 186 }]}
      />
    )

    expect(screen.queryByText('Jan')).toBeNull()
    expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })

  it('formats through the caller', () => {
    render(
      <ChartTooltipContent
        config={config}
        active
        payload={[{ dataKey: 'desktop', value: 186 }]}
        formatter={(value) => `${value} px`}
        labelFormatter={(label) => `${label} 2026`}
      />
    )

    expect(screen.getByText('186 px')).toBeInTheDocument()
  })
})

describe('ChartTooltip', () => {
  it('renders inside a chart and stays hidden until hovered', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config}>
        <LineChart data={data}>
          <Line dataKey="desktop" />
          <ChartTooltip />
        </LineChart>
      </ChartContainer>
    )

    // recharts mounts the wrapper hidden; asserting on visibility rather than
    // presence keeps this honest about what a tooltip does before a hover.
    const wrapper = container.querySelector('.recharts-tooltip-wrapper') as HTMLElement | null
    expect(wrapper).not.toBeNull()
    expect(wrapper?.style.visibility).toBe('hidden')
  })
})

describe('ChartLegend', () => {
  it('renders inside a chart with the configured labels', () => {
    const { container } = render(
      <ChartContainer width={400} height={300} config={config}>
        <LineChart data={data}>
          <Line dataKey="desktop" />
          <Line dataKey="mobile" />
          <ChartLegend />
        </LineChart>
      </ChartContainer>
    )

    expect(container.querySelector('.recharts-legend-wrapper')).not.toBeNull()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })
})
