import type { Meta, StoryObj } from '@storybook/react'
import {
  AgentStep,
  AgentStepList,
  ToolCallCard,
  ToolCallCode,
  ToolCallSection,
} from './ToolCallCard'

const meta: Meta<typeof ToolCallCard> = {
  title: 'Components/ToolCallCard',
  component: ToolCallCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[44rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ToolCallCard>

export const Success: Story = {
  args: {
    name: 'web_search',
    status: 'success',
    summary: 'token refresh ordering',
    durationMs: 842,
    defaultOpen: true,
    children: (
      <>
        <ToolCallSection label="Parameters">
          <ToolCallCode>{`{
  "query": "oauth token refresh before retry 401",
  "limit": 5
}`}</ToolCallCode>
        </ToolCallSection>
        <ToolCallSection label="Result">
          <ToolCallCode>{`5 results · top: "Avoiding 401 loops" (example.com)`}</ToolCallCode>
        </ToolCallSection>
      </>
    ),
  },
}

export const Running: Story = {
  args: {
    name: 'read_file',
    status: 'running',
    summary: 'src/lib/http.ts',
    defaultOpen: true,
    children: (
      <ToolCallSection label="Parameters">
        <ToolCallCode>{`{ "path": "src/lib/http.ts" }`}</ToolCallCode>
      </ToolCallSection>
    ),
  },
}

export const Error: Story = {
  args: {
    name: 'run_tests',
    status: 'error',
    summary: '2 failing',
    durationMs: 12400,
    defaultOpen: true,
    children: (
      <>
        <ToolCallSection label="Parameters">
          <ToolCallCode>{`{ "pattern": "auth/**/*.test.ts" }`}</ToolCallCode>
        </ToolCallSection>
        <ToolCallSection label="Error">
          <ToolCallCode>{`auth/refresh.test.ts
  ✕ retries exactly once (timeout after 12000ms)
  ✕ surfaces the refresh error (expected 401, got 500)`}</ToolCallCode>
        </ToolCallSection>
      </>
    ),
  },
}

export const Collapsed: Story = {
  args: {
    name: 'list_dir',
    status: 'success',
    summary: '18 files',
    durationMs: 96,
    children: <ToolCallCode>src/components</ToolCallCode>,
  },
}

export const AgentTrace: Story = {
  render: () => (
    <AgentStepList>
      <AgentStep
        title="Read the failing test"
        status="success"
        description="auth/refresh.test.ts · 3 assertions"
      />
      <AgentStep
        title="Search for the refresh call site"
        status="success"
        description="Found 2 call sites, one unawaited"
      />
      <AgentStep
        title="Patch the retry ordering"
        status="running"
        description="Editing src/lib/http.ts"
      />
      <AgentStep
        title="Run the suite again"
        status="error"
        description="Blocked until the patch applies"
      />
    </AgentStepList>
  ),
}
