import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DirectionProvider, useDirectionControls } from './Direction'

const meta = {
  title: 'Components/Direction',
  component: DirectionProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Direction context for RTL layouts. One `dir` on the app shell instead of threading it through every call site. Note that the library styles box edges with physical utilities — a component with mirrored padding needs the logical form or `rtl:` variants.',
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof DirectionProvider>

export default meta
type Story = StoryObj<typeof meta>

const Fixture = ({ dir }: { dir: 'ltr' | 'rtl' }) => (
  <div dir={dir} className="w-[320px] rounded-lg border border-border p-4">
    <p className="text-sm font-medium">Inbox</p>
    <p className="mt-1 text-xs text-muted-foreground">
      Direction: <strong>{dir}</strong>
    </p>
    <div className="mt-3 flex items-center gap-2">
      <span className="rounded-md bg-muted px-2 py-1 text-xs">1 unread</span>
      <span className="rounded-md bg-muted px-2 py-1 text-xs">Archived</span>
    </div>
    <p lang="ar" className="mt-3 text-sm">
      مرحبا بك في صندوق الوارد
    </p>
  </div>
)

export const LeftToRight: Story = {
  render: () => (
    <DirectionProvider dir="ltr">
      <Fixture dir="ltr" />
    </DirectionProvider>
  ),
}

export const RightToLeft: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <Fixture dir="rtl" />
    </DirectionProvider>
  ),
}

const Switcher = () => {
  const { dir, setDir } = useDirectionControls()

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="w-fit rounded-md border border-input px-3 py-1.5 text-sm"
        onClick={() => setDir(dir === 'ltr' ? 'rtl' : 'ltr')}
      >
        Switch to {dir === 'ltr' ? 'RTL' : 'LTR'}
      </button>
      <Fixture dir={dir} />
    </div>
  )
}

/** The provider owns the direction; a control inside the tree flips it. */
export const Uncontrolled: Story = {
  render: () => (
    <DirectionProvider defaultDir="ltr">
      <Switcher />
    </DirectionProvider>
  ),
}

const ControlledSwitcher = () => {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr')

  return (
    <DirectionProvider dir={dir} onDirChange={setDir} applyToDocument>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="w-fit rounded-md border border-input px-3 py-1.5 text-sm"
          onClick={() => setDir(dir === 'ltr' ? 'rtl' : 'ltr')}
        >
          Switch direction
        </button>
        <Fixture dir={dir} />
      </div>
    </DirectionProvider>
  )
}

/**
 * `applyToDocument` mirrors the value onto `<html dir>` — turn it on when the
 * provider is not at the document root, so portalled dialogs and menus follow.
 */
export const WithDocumentSync: Story = {
  render: () => <ControlledSwitcher />,
}
