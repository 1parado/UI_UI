import type { Meta, StoryObj } from '@storybook/react'
import { Cascader } from './Cascader'
import type { CascaderOption } from '@/lib/cascader'

const regions: CascaderOption[] = [
  {
    value: 'zj',
    label: 'Zhejiang',
    children: [
      {
        value: 'hz',
        label: 'Hangzhou',
        children: [
          { value: 'xh', label: 'Xihu' },
          { value: 'gs', label: 'Gongshu' },
          { value: 'yh', label: 'Yuhang' },
        ],
      },
      {
        value: 'nb',
        label: 'Ningbo',
        children: [
          { value: 'hs', label: 'Haishu' },
          { value: 'yz', label: 'Yinzhou' },
        ],
      },
    ],
  },
  {
    value: 'js',
    label: 'Jiangsu',
    children: [
      {
        value: 'nj',
        label: 'Nanjing',
        children: [{ value: 'xw', label: 'Xuanwu' }],
      },
      { value: 'sz', label: 'Suzhou', disabled: true },
    ],
  },
  {
    value: 'gd',
    label: 'Guangdong',
    children: [{ value: 'gz', label: 'Guangzhou' }],
  },
]

const meta = {
  title: 'Components/Cascader',
  component: Cascader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tree that would rather stay open: every visited level stays on screen as its own column, so picking Zhejiang → Hangzhou → Xihu never loses the branch you came down. The value is the **chain of ids**, not the leaf alone. Clicking a parent only walks deeper unless `changeOnSelect` is set — then a parent is a legal answer, because "all of Zhejiang" is a thing people actually pick.',
      },
    },
  },
  args: {
    options: regions,
    'aria-label': 'Region',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Cascader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Cascader key={size} {...args} options={regions} size={size} />
      ))}
    </div>
  ),
}

export const Clearable: Story = {
  args: { clearable: true, defaultValue: ['zj', 'hz', 'xh'] },
}

export const ChangeOnSelect: Story = {
  args: { changeOnSelect: true, clearable: true },
  parameters: {
    docs: {
      description: {
        story: 'A district is optional detail: stopping at the province is allowed here.',
      },
    },
  },
}

export const Searchable: Story = {
  args: { showSearch: true, searchPlaceholder: 'Search a district…' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: ['gd', 'gz'], options: regions },
}
