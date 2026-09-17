import type { Meta, StoryObj } from '@storybook/react'
import { ArrowUpToLineIcon, PencilIcon, PlusIcon, SettingsIcon } from '@/lib/icons'
import { BackTop, FloatButton, FloatButtonGroup } from './FloatButton'

const meta = {
  title: 'Components/FloatButton',
  component: FloatButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A floating action button. Pinned to a corner on its own; inside a `FloatButtonGroup` the group owns the corner and these stack against it. `BackTop` is the same button with a scroll threshold.',
      },
    },
  },
  args: { icon: <PlusIcon aria-hidden className="size-4" />, tooltip: 'New document' },
} satisfies Meta<typeof FloatButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <FloatButton key={size} {...args} size={size} position="bottom-left" />
      ))}
    </div>
  ),
}

export const Primary: Story = {
  args: { variant: 'primary', tooltip: 'Create' },
}

/** A text label turns the circle into a pill. */
export const WithALabel: Story = {
  args: {
    label: 'New document',
    tooltip: undefined,
    icon: <PlusIcon aria-hidden className="size-4" />,
  },
}

export const Corners: Story = {
  render: (args) => (
    <div className="grid h-[320px] w-[520px] grid-cols-2 gap-4 rounded-lg border border-border p-4">
      <span className="text-xs text-muted-foreground">top-left</span>
      <span className="text-right text-xs text-muted-foreground">top-right</span>
      <span className="self-end text-xs text-muted-foreground">bottom-left</span>
      <span className="self-end text-right text-xs text-muted-foreground">
        bottom-right
      </span>
      <FloatButton {...args} position="top-left" tooltip="top-left" />
      <FloatButton {...args} position="top-right" tooltip="top-right" />
      <FloatButton {...args} position="bottom-left" tooltip="bottom-left" />
      <FloatButton {...args} position="bottom-right" tooltip="bottom-right" />
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <FloatButtonGroup position="bottom-right">
      <FloatButton
        icon={<PencilIcon aria-hidden className="size-4" />}
        tooltip="Edit"
        size="sm"
      />
      <FloatButton
        icon={<SettingsIcon aria-hidden className="size-4" />}
        tooltip="Settings"
        size="sm"
      />
      <FloatButton
        icon={<PlusIcon aria-hidden className="size-4" />}
        tooltip="New"
        variant="primary"
      />
    </FloatButtonGroup>
  ),
}

/** Collapsed behind a trigger until it is clicked. */
export const GroupBehindATrigger: Story = {
  render: () => (
    <FloatButtonGroup
      trigger="click"
      label="More actions"
      icon={<PlusIcon aria-hidden className="size-4" />}
    >
      <FloatButton
        icon={<PencilIcon aria-hidden className="size-4" />}
        tooltip="Edit"
        size="sm"
      />
      <FloatButton
        icon={<SettingsIcon aria-hidden className="size-4" />}
        tooltip="Settings"
        size="sm"
      />
    </FloatButtonGroup>
  ),
}

export const BackToTop: StoryObj<typeof BackTop> = {
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Appears once the page has scrolled past 200px. Scroll this frame.
      </p>
      <div
        data-backtop-frame
        className="h-[360px] w-[520px] overflow-y-auto rounded-lg border border-border p-4"
      >
        <div className="h-[1200px] space-y-4">
          <p className="text-sm text-muted-foreground">Keep scrolling…</p>
          <BackTop
            visibilityHeight={200}
            target={() => document.querySelector<HTMLElement>('[data-backtop-frame]')}
          />
        </div>
      </div>
    </div>
  ),
}

export const BackTopWithItsOwnIcon: StoryObj<typeof BackTop> = {
  render: () => (
    <BackTop
      label="Jump to the top"
      icon={<ArrowUpToLineIcon aria-hidden className="size-4" />}
    />
  ),
}
