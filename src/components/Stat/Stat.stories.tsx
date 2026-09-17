import type { Meta, StoryObj } from '@storybook/react'
import { Stat } from './Stat'
import { ClockIcon, TrendingUpIcon } from '@/lib/icons'

const meta: Meta<typeof Stat> = {
  title: 'Components/Stat',
  component: Stat,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Stat>

export const Default: Story = {
  args: {
    label: 'Monthly recurring revenue',
    value: '¥128,400',
    delta: 12.4,
    deltaLabel: 'vs last month',
    className: 'w-[260px]',
  },
}

/**
 * The sign picks the arrow; `higherIsBetter` decides whether it reads as good
 * news. Error rates, latency and spend all want `higherIsBetter={false}`.
 */
export const TrendDirections: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat label="Signups" value="1,204" delta={8.1} deltaLabel="vs last week" />
      <Stat label="Churn" value="2.4%" delta={8.1} deltaLabel="vs last week" higherIsBetter={false} />
      <Stat label="Uptime" value="99.98%" delta={0} deltaLabel="unchanged" />
      <Stat
        label="Median latency"
        value="184ms"
        delta={-14.6}
        deltaLabel="vs last week"
        higherIsBetter={false}
        hint="p50 across all regions"
      />
    </div>
  ),
}

/** A sparkline turns the figure into a shape without adding an axis. */
export const WithSparkline: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        label="Tokens used"
        value="1.24M"
        delta={12.4}
        deltaLabel="vs last week"
        icon={<TrendingUpIcon />}
        sparkline={[820, 932, 901, 1120, 998, 1240]}
      />
      <Stat
        label="Requests"
        value="48.2k"
        delta={-3.1}
        deltaLabel="vs last week"
        sparkline={[42, 51, 49, 46, 44, 48]}
      />
      <Stat
        label="Avg. response"
        value="1.8s"
        delta={6.2}
        deltaLabel="vs last week"
        higherIsBetter={false}
        icon={<ClockIcon />}
        sparkline={[1.4, 1.5, 1.6, 1.7, 1.7, 1.8]}
      />
    </div>
  ),
}

/**
 * `variant="bare"` drops the border so the stat can sit inside a `Card` or a
 * dashboard cell you already have.
 */
export const Bare: Story = {
  args: {
    label: 'Open incidents',
    value: '3',
    delta: -25,
    deltaLabel: 'vs yesterday',
    higherIsBetter: false,
    variant: 'bare',
    className: 'w-[240px]',
  },
}

/** Preformatting the delta replaces the default percentage rendering. */
export const CustomDeltaFormat: Story = {
  args: {
    label: 'Storage',
    value: '412 GB',
    delta: 38,
    deltaFormat: (delta: number) => `+${delta} GB`,
    deltaLabel: 'this month',
    hint: 'of 1 TB provisioned',
    className: 'w-[260px]',
  },
}

/**
 * Market data inverts the meaning of the sign: a Chinese stock board paints a
 * rise red and a fall green, so `higherIsBetter={false}` is what a quote card
 * wants. The default (a rise is good news, in the success colour) is the
 * business-metric reading.
 */
export const MarketConvention: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        label="沪深300"
        value="4,128.62"
        delta={1.24}
        deltaLabel="今日"
        higherIsBetter={false}
        className="w-[200px]"
      />
      <Stat
        label="创业板指"
        value="2,046.18"
        delta={-0.86}
        deltaLabel="今日"
        higherIsBetter={false}
        className="w-[200px]"
      />
      <Stat
        label="S&P 500"
        value="5,812.40"
        delta={0.42}
        deltaLabel="today"
        className="w-[200px]"
      />
    </div>
  ),
}

