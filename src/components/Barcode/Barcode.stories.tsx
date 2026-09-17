import type { Meta, StoryObj } from '@storybook/react'
import { Barcode } from './Barcode'

const meta = {
  title: 'Components/Barcode',
  component: Barcode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A Code 128 barcode with no dependency behind it — `lib/code128` turns the text into symbol widths and this draws rectangles. Numbers get half the symbols of letters: long digit runs latch into Code C, which carries two digits per symbol, and an odd trailing digit drops back to Code B. **Both the white background and the black bars are fixed**, for the same reason as `QRCode`: a laser reads dark bars on light, so the code stays scannable in a dark theme instead of merely looking good in one.',
      },
    },
  },
  args: {
    value: 'SF-2026-0042',
  },
  argTypes: {
    codeSet: { control: 'inline-radio', options: ['auto', 'A', 'B', 'C'] },
    moduleWidth: { control: { type: 'range', min: 1, max: 6, step: 1 } },
  },
} satisfies Meta<typeof Barcode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Numeric: Story = {
  args: { value: '1234567890128' },
}

export const SmallOnScreen: Story = {
  args: { value: 'SKU-9931', height: 40, moduleWidth: 1 },
}

export const PrintReady: Story = {
  args: { value: 'SF-2026-0042', height: 80, moduleWidth: 3 },
}

export const NoCaption: Story = {
  args: { showText: false },
}

export const ForceACodeSet: Story = {
  args: { value: 'MIXED-42', codeSet: 'B' },
}

export const NotEncodable: Story = {
  args: { value: '中文·条码' },
}
