import type { Meta, StoryObj } from '@storybook/react'
import { Anchor } from './Anchor'

const meta = {
  title: 'Components/Anchor',
  component: Anchor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A table of contents that highlights where you are. The links are **real `<a href="#id">` elements**, so they work without JavaScript and can be copied; the click handler only takes over to land the target below a sticky header.',
      },
    },
  },
  args: {
    items: [
      { id: 'getting-started', title: 'Getting started' },
      {
        id: 'guides',
        title: 'Guides',
        children: [
          { id: 'guides-forms', title: 'Forms' },
          { id: 'guides-tables', title: 'Tables' },
        ],
      },
      { id: 'api', title: 'API reference' },
    ],
  },
} satisfies Meta<typeof Anchor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Nested: Story = {
  args: {
    items: [
      { id: 'one', title: 'One' },
      {
        id: 'two',
        title: 'Two',
        children: [
          { id: 'two-a', title: 'Two A' },
          {
            id: 'two-b',
            title: 'Two B',
            children: [{ id: 'two-b-i', title: 'Two B i' }],
          },
        ],
      },
      { id: 'three', title: 'Three', disabled: true },
    ],
  },
}

const Sections = () => (
  <div className="h-[400px] w-[640px] overflow-y-auto rounded-lg border border-border">
    <div className="grid grid-cols-[160px_1fr] gap-6 p-6">
      <Anchor
        className="sticky top-0 self-start"
        offsetTop={8}
        target={() => document.querySelector<HTMLElement>('[data-anchor-frame]')}
        items={[
          { id: 's-intro', title: 'Introduction' },
          { id: 's-install', title: 'Install' },
          { id: 's-usage', title: 'Usage' },
        ]}
      />
      <div className="space-y-64">
        {[
          ['s-intro', 'Introduction'],
          ['s-install', 'Install'],
          ['s-usage', 'Usage'],
        ].map(([id, title]) => (
          <section key={id} id={id}>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Scroll this frame — the list on the left follows. Clicking a link
              scrolls the heading to the top of the frame rather than under it.
            </p>
          </section>
        ))}
      </div>
    </div>
  </div>
)

export const AgainstAScrollContainer: Story = { render: () => <Sections /> }

export const WithADisabledSection: Story = {
  args: {
    items: [
      { id: 'public', title: 'Public' },
      { id: 'internal', title: 'Internal', disabled: true },
    ],
  },
}
