import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './Slider'
import { Label } from '../Label'

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  render: () => (
    <Slider
      defaultValue={[25]}
      max={100}
      step={1}
      aria-label="Volume"
      className="w-[300px]"
    />
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[300px] gap-4">
      <Label htmlFor="volume">Volume</Label>
      <Slider id="volume" defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const Range: Story = {
  render: () => (
    <Slider
      defaultValue={[25, 75]}
      min={0}
      max={100}
      step={1}
      aria-label="Price range"
      className="w-[300px]"
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <Slider
      defaultValue={[40]}
      max={100}
      step={1}
      disabled
      aria-label="Volume"
      className="w-[300px]"
    />
  ),
}

export const MinMaxSteps: Story = {
  render: () => (
    <Slider
      defaultValue={[500]}
      min={0}
      max={1000}
      step={100}
      aria-label="Budget"
      className="w-[300px]"
    />
  ),
}
