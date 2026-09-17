import type { Meta, StoryObj } from '@storybook/react'
import { Statistic } from './Statistic'
import { AlertCircleIcon, InboxIcon } from '@/lib/icons'

const meta = {
  title: 'Components/Statistic',
  component: Statistic,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The number itself, formatted properly. `Stat` is the card — label, delta and trend line laid out together — while this owns what happens to a single figure: thousands separators, fixed precision, a currency mark placed *outside* the minus sign, and `—` where a value never arrived. A dashboard showing `NaN` has quietly told its reader that nobody checked. Switch the trend colours over with `higherIsBetter: false` for error rates, latency and spend, where a rise is bad news.',
      },
    },
  },
  args: {
    value: 84310,
    label: 'Monthly recurring revenue',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['bare', 'card'] },
  },
} satisfies Meta<typeof Statistic>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Currency: Story = {
  args: {
    prefix: '¥',
    precision: 2,
    trend: 'up',
    trendValue: '+12.4%',
    hint: 'vs last month',
    variant: 'card',
  },
}

export const Loss: Story = {
  args: {
    value: -1204.5,
    prefix: '¥',
    precision: 2,
    trend: 'down',
    trendValue: '-4.1%',
    hint: 'Refunds exceeded upgrades',
    variant: 'card',
  },
}

export const WhereDownIsGood: Story = {
  args: {
    value: 214,
    label: 'p95 latency',
    suffix: ' ms',
    precision: 1,
    trend: 'up',
    trendValue: '+18 ms',
    higherIsBetter: false,
    variant: 'card',
  },
  parameters: {
    docs: {
      description: {
        story: 'Latency going up is red; `higherIsBetter: false` is what turns it around.',
      },
    },
  },
}

export const EuropeanSeparators: Story = {
  args: {
    value: 1234567.89,
    precision: 2,
    groupSeparator: ' ',
    decimalSeparator: ',',
    prefix: '€',
  },
}

export const CountingUp: Story = {
  args: {
    value: 84310,
    prefix: '¥',
    countUp: true,
    duration: 1600,
    hint: 'Reload the frame to watch it settle',
    variant: 'card',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Eased rather than linear, starting from whatever was on screen before, and skipped entirely for `prefers-reduced-motion: reduce`.',
      },
    },
  },
}

export const FailedToLoad: Story = {
  args: {
    value: Number.NaN,
    label: 'Conversion rate',
    suffix: '%',
    hint: 'Upstream export has not run since Tuesday',
    variant: 'card',
    icon: <AlertCircleIcon />,
  },
}

export const Loading: Story = {
  args: { loading: true, variant: 'card', icon: <InboxIcon /> },
}
