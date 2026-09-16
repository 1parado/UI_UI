import type { Meta, StoryObj } from '@storybook/react'
import {
  Blockquote,
  Heading,
  InlineCode,
  Small,
  Text,
} from './Typography'

const meta: Meta<typeof Heading> = {
  title: 'Components/Typography',
  component: Heading,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Heading>

export const Headings: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Heading level={1}>Component library</Heading>
      <Heading level={2}>Installation</Heading>
      <Heading level={3}>Design tokens</Heading>
      <Heading level={4}>Dark mode</Heading>
    </div>
  ),
}

export const Body: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <Text variant="lead">
        A calm React component library — tokens only, keyboard first, light and
        dark treated as equals.
      </Text>
      <Text>
        Every component ships as a thin layer over tokens defined in{' '}
        <InlineCode>globals.css</InlineCode>, so restyling the library means
        restyling the variables rather than overriding classes.
      </Text>
      <Text variant="muted">
        Nothing here animates unless the motion carries meaning.
      </Text>
      <Small>Last updated 16 September 2026</Small>
    </div>
  ),
}

export const Quote: Story = {
  render: () => (
    <Blockquote className="max-w-xl text-lg">
      Consistency beats taste, clarity beats cleverness, restraint beats
      decoration.
    </Blockquote>
  ),
}

/** `as` changes the element without changing the look. */
export const InlineUsage: Story = {
  render: () => (
    <Text as="span" variant="muted" className="text-sm">
      Rendered as a span instead of a paragraph.
    </Text>
  ),
}
