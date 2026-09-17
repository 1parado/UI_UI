import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Signature } from './Signature'
import type { SignatureHandle } from './Signature'
import { Button } from '@/components/Button'

const meta = {
  title: 'Components/Signature',
  component: Signature,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A signature pad that keeps strokes as *points* rather than painting straight into the canvas — so it can resize without the ink stretching, `undo` can drop one stroke without wiping the rest, and `isEmpty` does not have to compare pixels. The backing store is scaled for the device pixel ratio, and the export is a transparent PNG by default, because a signature usually lands on top of a document rather than replacing it.',
      },
    },
  },
  args: {
    height: 180,
  },
} satisfies Meta<typeof Signature>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

function DrivenFromOutsideDemo(args: React.ComponentProps<typeof Signature>) {
  const pad = React.useRef<SignatureHandle>(null)
  const [signed, setSigned] = React.useState<string | null>(null)

  return (
    <div className="space-y-3">
      <Signature
        {...args}
        ref={pad}
        onChange={setSigned}
        placeholder="Sign to accept the terms"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setSigned(pad.current?.toDataURL() ?? null)}>
          Capture
        </Button>
        <Button size="sm" variant="ghost" onClick={() => pad.current?.undo()}>
          Undo a stroke
        </Button>
        <span className="text-xs text-muted-foreground">
          {signed ? `Signed (${Math.round(signed.length / 1024)} kB)` : 'Nothing captured'}
        </span>
      </div>
      {signed && (
        <img src={signed} alt="Captured signature" className="h-24 rounded border border-border" />
      )}
    </div>
  )
}

export const DrivenFromOutside: Story = {
  render: (args) => <DrivenFromOutsideDemo {...args} />,
}

export const ThickerPen: Story = {
  args: { lineWidth: 4, penColor: 'hsl(222 47% 11%)' },
}

export const OnWhite: Story = {
  args: { backgroundColor: '#ffffff', penColor: '#111111' },
  parameters: {
    docs: {
      description: {
        story: 'Flatten the export when the destination wants opaque pixels.',
      },
    },
  },
}

export const ReadOnly: Story = {
  args: { disabled: true },
}

export const WithoutControls: Story = {
  args: { showControls: false, placeholder: 'Sign here to sign off the shipment' },
}
