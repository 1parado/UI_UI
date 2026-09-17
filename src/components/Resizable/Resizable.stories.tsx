import type * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './Resizable'

const meta = {
  title: 'Components/Resizable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A split pane, wrapping react-resizable-panels **v4**. Mind the two differences from the shadcn examples written against v2/v3: the container takes `orientation` (`direction` also works), and **a numeric `defaultSize` is pixels, not percent** — write `"30%"` for a percentage. Persistence is `storageKey`.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Pane = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="flex h-full flex-col gap-2 p-4">
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{children}</p>
  </div>
)

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[280px] w-[560px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="30%">
        <Pane title="Sidebar">Drag the divider</Pane>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Pane title="Content">Everything else</Pane>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

/** `minSize` accepts a length, so a pane can refuse to go below a real width. */
export const WithMinimums: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[280px] w-[560px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="220px" minSize="180px" maxSize="360px">
        <Pane title="Fixed-ish">220px, clamped 180–360</Pane>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize="30%">
        <Pane title="Flexible">At least 30%</Pane>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="h-[320px] w-[420px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="60%">
        <Pane title="Editor">The grip rotates with the split</Pane>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Pane title="Output" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Nested: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[320px] w-[640px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="22%">
        <Pane title="Files" />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <Pane title="Editor" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%">
            <Pane title="Terminal" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="26%">
        <Pane title="Inspector" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

/**
 * `storageKey` keeps the split across reloads. Move the divider, then reload
 * the story — the widths come back.
 */
export const Persisted: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      storageKey="storybook-resizable-persisted"
      className="h-[240px] w-[520px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="40%">
        <Pane title="Left">Reload to see it stick</Pane>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Pane title="Right" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

/** `groupRef` and `panelRef` come straight from the package. */
export const Collapsible: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[240px] w-[520px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="28%" minSize="180px" collapsible collapsedSize="0%">
        <Pane title="Collapsible">Drag past the minimum to collapse</Pane>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Pane title="Content" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      disabled
      className="h-[200px] w-[480px] rounded-lg border border-border"
    >
      <ResizablePanel defaultSize="50%">
        <Pane title="Locked" />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Pane title="Locked" />
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
