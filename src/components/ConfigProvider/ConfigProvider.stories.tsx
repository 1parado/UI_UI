import type { Meta, StoryObj } from '@storybook/react'
import { ConfigProvider, useConfig, useLocale } from './ConfigProvider'
import { zhCN } from '@/lib/config'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Statistic } from '@/components/Statistic'

function Readout() {
  const config = useConfig()
  const locale = useLocale()

  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Size</dt>
        <dd className="font-medium">{config.size}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Theme</dt>
        <dd className="font-medium">{config.theme ?? 'unset'}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Direction</dt>
        <dd className="font-medium">{config.direction ?? 'unset'}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">{locale.search}</dt>
        <dd className="font-medium">{locale.empty}</dd>
      </div>
    </dl>
  )
}

const meta = {
  title: 'Components/ConfigProvider',
  component: ConfigProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'App-wide defaults in one place. **Sizing is opt-in**: nothing reaches into components that already take a `size`, because a component that ignores its own prop is worse than one with sensible defaults — read it back with `useConfig()` where you want screens to agree. **Theme and direction are applied**, since those belong to the document: the `dark` class goes on `<html>` (and whatever was on it is restored on unmount), and `direction` gets a wrapper. Nesting inherits everything the inner provider did not set, and a partial `locale` replaces only the keys it names.',
      },
    },
  },
  args: { children: <Readout /> },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    theme: { control: 'inline-radio', options: ['light', 'dark', 'system'] },
    direction: { control: 'inline-radio', options: ['ltr', 'rtl'] },
  },
} satisfies Meta<typeof ConfigProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Chinese: Story = {
  args: { locale: zhCN },
}

export const SmallAndSelected: Story = {
  args: { size: 'sm' },
  parameters: {
    docs: {
      description: {
        story:
          'Nothing here resizes itself — components take `size` from this context by reading it, so a whole screen can agree without every prop being repeated.',
      },
    },
  },
}

export const ReadingItBack: Story = {
  render: (args) => (
    <ConfigProvider {...args} size="lg" locale={zhCN}>
      <div className="space-y-3">
        <Readout />
        <Input placeholder="Search…" />
        <div className="flex gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
        </div>
        <Statistic label="Requests today" value={128430} />
      </div>
    </ConfigProvider>
  ),
}

export const NestedOverrides: Story = {
  render: (args) => (
    <ConfigProvider {...args} locale={zhCN}>
      <div className="space-y-4">
        <Readout />
        <ConfigProvider size="sm" locale={{ search: 'Find…' }}>
          <div className="rounded-md border border-border p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Inner provider: size overridden, one word replaced.
            </p>
            <Readout />
          </div>
        </ConfigProvider>
      </div>
    </ConfigProvider>
  ),
}

export const DarkMode: Story = {
  args: { theme: 'dark' },
  parameters: {
    docs: {
      description: {
        story:
          'Applied to `<html>`, so page background, scrollbars and portalled overlays all follow. Unmounting puts back whatever was there before.',
      },
    },
  },
}
