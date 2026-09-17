import type { Meta, StoryObj } from '@storybook/react'
import { NativeSelect } from './NativeSelect'

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The platform `<select>`, styled to sit beside `Input`. Not a replacement for `Select` — this one hands the choice to the OS, which is what a phone form wants, and it participates in native submission.',
      },
    },
  },
  args: { 'aria-label': 'Region' },
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <NativeSelect {...args} defaultValue="eu" className="w-64">
      <option value="us">United States</option>
      <option value="eu">European Union</option>
      <option value="jp">Japan</option>
    </NativeSelect>
  ),
}

export const WithGroups: Story = {
  render: (args) => (
    <NativeSelect {...args} defaultValue="eu" className="w-64">
      <optgroup label="Americas">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </optgroup>
      <optgroup label="Europe">
        <option value="eu">European Union</option>
        <option value="uk">United Kingdom</option>
      </optgroup>
    </NativeSelect>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-3">
      <NativeSelect {...args} selectSize="sm" defaultValue="sm">
        <option value="sm">Small</option>
      </NativeSelect>
      <NativeSelect {...args} selectSize="default" defaultValue="default">
        <option value="default">Default</option>
      </NativeSelect>
      <NativeSelect {...args} selectSize="lg" defaultValue="lg">
        <option value="lg">Large</option>
      </NativeSelect>
    </div>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <NativeSelect {...args} invalid defaultValue="" className="w-64">
      <option value="" disabled>
        Choose a region
      </option>
      <option value="us">United States</option>
    </NativeSelect>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <NativeSelect {...args} disabled defaultValue="eu" className="w-64">
      <option value="eu">European Union</option>
    </NativeSelect>
  ),
}

/** Compare with `Select`, which can hold icons and descriptions in its rows. */
export const InAForm: Story = {
  render: (args) => (
    <form className="flex w-72 flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
      <NativeSelect {...args} name="region" defaultValue="eu">
        <option value="us">United States</option>
        <option value="eu">European Union</option>
      </NativeSelect>
      <NativeSelect aria-label="Timezone" name="tz" defaultValue="utc" selectSize="sm">
        <option value="utc">UTC</option>
        <option value="cet">CET</option>
      </NativeSelect>
    </form>
  ),
}
