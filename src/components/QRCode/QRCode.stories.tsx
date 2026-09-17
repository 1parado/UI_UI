import type { Meta, StoryObj } from '@storybook/react'
import { QRCode } from './QRCode'

const meta = {
  title: 'Components/QRCode',
  component: QRCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A QR code. The quiet zone and the polarity are deliberately **not** themeable: dark modules on a light ground is what scanners expect, and inverting it for dark mode is rejected by a meaningful share of them. Change the colours only after testing with a real camera.',
      },
    },
  },
  args: { value: 'https://parado.dev/pair?token=8f2c91', label: 'Pairing code' },
} satisfies Meta<typeof QRCode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {[96, 128, 200].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <QRCode {...args} size={size} />
          <span className="text-xs text-muted-foreground">{size}px</span>
        </div>
      ))}
    </div>
  ),
}

/** Higher correction survives more damage, at the cost of a denser code. */
export const CorrectionLevels: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {(['L', 'M', 'Q', 'H'] as const).map((level) => (
        <div key={level} className="flex flex-col items-center gap-2">
          <QRCode {...args} level={level} />
          <span className="text-xs text-muted-foreground">level {level}</span>
        </div>
      ))}
    </div>
  ),
}

/**
 * A logo needs a higher correction level — the image covers modules that the
 * code then has to reconstruct. `excavate` clears the modules underneath it.
 */
export const WithLogo: Story = {
  render: (args) => (
    <QRCode
      {...args}
      level="H"
      size={200}
      imageSettings={{
        src: 'https://github.com/identicons/paradox.png',
        height: 40,
        width: 40,
        excavate: true,
      }}
    />
  ),
}

export const Colours: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      <QRCode {...args} fgColor="#1e3a8a" />
      <QRCode {...args} fgColor="#065f46" />
      <QRCode {...args} fgColor="#000000" bgColor="#f5f5f5" />
    </div>
  ),
}

/** `as="canvas"` gives you a node you can call `toDataURL()` on. */
export const AsCanvas: Story = {
  render: (args) => (
    <QRCode value={args.value} label={args.label} as="canvas" size={160} />
  ),
}

export const InAPanel: Story = {
  render: (args) => (
    <div className="w-[320px] rounded-lg border border-border bg-card p-5 text-center">
      <p className="text-sm font-medium">Scan to pair</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Open the mobile app and point it at the code.
      </p>
      <div className="mt-4 flex justify-center">
        <QRCode {...args} size={168} />
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">8f2c-91ab-40de</p>
    </div>
  ),
}

/**
 * What you should not do: `bgColor` following a theme token. On a dark surface
 * this is a light code on a dark ground, and some scanners refuse it.
 */
export const WrongPolarity: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <QRCode {...args} size={140} />
        <span className="text-xs text-success">spec polarity</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <QRCode {...args} size={140} fgColor="#ffffff" bgColor="#111827" />
        <span className="text-xs text-destructive">inverted — avoid</span>
      </div>
    </div>
  ),
}
