import type { Meta, StoryObj } from '@storybook/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartLegend, ChartTooltip } from './Chart'

const meta = {
  title: 'Components/Chart',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'recharts put on the library\'s tokens. `ChartContainer` resolves a `config` into `--color-<series>` variables, so a series references its **name** rather than a hex value, and it is what `ChartTooltip` reads to label a hovered point. The recharts primitives are re-exported, so a consumer does not need to add recharts.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const monthly = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
]

const trafficConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
}

export const AreaChart_: Story = {
  name: 'Area',
  render: () => (
    <ChartContainer className="h-[280px] w-[560px]" config={trafficConfig}>
      <AreaChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <ChartTooltip />
        <ChartLegend />
        <Area
          dataKey="desktop"
          type="monotone"
          fill="var(--color-desktop)"
          fillOpacity={0.2}
          stroke="var(--color-desktop)"
        />
        <Area
          dataKey="mobile"
          type="monotone"
          fill="var(--color-mobile)"
          fillOpacity={0.2}
          stroke="var(--color-mobile)"
        />
      </AreaChart>
    </ChartContainer>
  ),
}

export const LineChart_: Story = {
  name: 'Line',
  render: () => (
    <ChartContainer className="h-[280px] w-[560px]" config={trafficConfig}>
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <ChartTooltip />
        <Line dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        <Line dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
}

const revenueConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-3)' },
  cost: { label: 'Cost', color: 'var(--chart-5)' },
}

export const BarChart_: Story = {
  name: 'Bar',
  render: () => (
    <ChartContainer className="h-[280px] w-[560px]" config={revenueConfig}>
      <BarChart
        data={monthly.map((row) => ({ month: row.month, revenue: row.desktop, cost: row.mobile }))}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <ChartTooltip />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
}

const shareConfig = {
  direct: { label: 'Direct', color: 'var(--chart-1)' },
  search: { label: 'Search', color: 'var(--chart-2)' },
  social: { label: 'Social', color: 'var(--chart-3)' },
  referral: { label: 'Referral', color: 'var(--chart-4)' },
}

const share = [
  { name: 'direct', value: 420 },
  { name: 'search', value: 310 },
  { name: 'social', value: 180 },
  { name: 'referral', value: 90 },
]

export const PieChart_: Story = {
  name: 'Pie',
  render: () => (
    <ChartContainer className="h-[280px] w-[420px]" config={shareConfig}>
      <PieChart>
        <ChartTooltip />
        <ChartLegend />
        <Pie data={share} dataKey="value" nameKey="name" innerRadius={54} outerRadius={90}>
          {share.map((entry) => (
            <Cell key={entry.name} fill={`var(--color-${entry.name})`} stroke="none" />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  ),
}

export const Radial: Story = {
  render: () => (
    <ChartContainer className="h-[280px] w-[320px]" config={{ score: { label: 'Score', color: 'var(--chart-1)' } }}>
      <RadialBarChart
        data={[{ name: 'score', value: 72 }]}
        innerRadius="60%"
        outerRadius="100%"
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar dataKey="value" fill="var(--color-score)" background cornerRadius={8} />
      </RadialBarChart>
    </ChartContainer>
  ),
}

/** `isEmpty` plus `empty` covers the "nothing to plot" case in one place. */
export const Empty: Story = {
  render: () => (
    <ChartContainer
      className="h-[240px] w-[480px] rounded-lg border border-dashed border-border"
      config={trafficConfig}
      isEmpty
      empty="No traffic recorded yet"
    >
      <AreaChart data={[]}>
        <Area dataKey="desktop" />
      </AreaChart>
    </ChartContainer>
  ),
}

/** Percentages need a sized ancestor — that is the usual cause of a blank chart. */
export const Responsive: Story = {
  render: () => (
    <div className="h-[280px] w-[560px]">
      <ChartContainer className="h-full w-full" config={trafficConfig}>
        <LineChart data={monthly}>
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <ChartTooltip content={{ indicator: 'line' }} />
          <Line dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </div>
  ),
}
