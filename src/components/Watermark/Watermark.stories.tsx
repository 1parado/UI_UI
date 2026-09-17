import type * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Watermark } from './Watermark'

const meta = {
  title: 'Components/Watermark',
  component: Watermark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tiles a mark across whatever it wraps, drawn on a canvas and used as a repeating background rather than as many DOM nodes. The layer is `pointer-events: none` and `aria-hidden`. By default a `MutationObserver` puts it back if it is deleted in devtools — a speed bump, not a lock.',
      },
    },
  },
  args: { content: 'Confidential', children: undefined },
} satisfies Meta<typeof Watermark>

export default meta
type Story = StoryObj<typeof meta>

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[220px] w-[520px] overflow-hidden rounded-lg border border-border bg-card p-5">
    {children}
  </div>
)

export const Default: Story = {
  render: (args) => (
    <Panel>
      <Watermark {...args}>
        <h3 className="text-base font-semibold">Quarterly report</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Figures are provisional and have not been audited.
        </p>
      </Watermark>
    </Panel>
  ),
}

/** Several lines are drawn as one block and tiled together. */
export const SeveralLines: Story = {
  render: (args) => (
    <Panel>
      <Watermark {...args} content={['Acme Corp', 'draft — do not distribute']} />
    </Panel>
  ),
}

export const Dense: Story = {
  render: (args) => (
    <Panel>
      <Watermark {...args} content="DRAFT" gap={[60, 40]} rotate={-30} />
    </Panel>
  ),
}

export const Heavy: Story = {
  render: (args) => (
    <Panel>
      <Watermark
        {...args}
        content="CONFIDENTIAL"
        font={{ fontSize: 20, fontWeight: 700, color: 'rgba(220, 38, 38, 0.18)' }}
        rotate={-18}
      />
    </Panel>
  ),
}

/** A logo instead of text — pass a data URL or any image the page can load. */
export const WithAnImage: Story = {
  render: (args) => (
    <Panel>
      <Watermark
        {...args}
        content={undefined}
        image="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><circle cx='24' cy='24' r='20' fill='none' stroke='rgba(128,128,128,0.5)' stroke-width='2'/></svg>"
        gap={[80, 80]}
        rotate={0}
      />
    </Panel>
  ),
}

/** Raising the opacity makes the mark part of the design rather than a hint. */
export const Faint: Story = {
  render: (args) => (
    <Panel>
      <Watermark {...args} content="Preview" opacity={0.4} />
    </Panel>
  ),
}
