import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Attachment, AttachmentList } from './AttachmentList'

const meta: Meta<typeof AttachmentList> = {
  title: 'Components/AttachmentList',
  component: AttachmentList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[42rem] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AttachmentList>

export const Files: Story = {
  render: () => (
    <AttachmentList>
      <Attachment name="auth-guard.ts" size="4.2 KB" />
      <Attachment name="incident-report.pdf" size="1.1 MB" />
      <Attachment name="trace.png" size="218 KB" type="image" />
    </AttachmentList>
  ),
}

// Inline data URIs keep the story self-contained (no network needed).
const LIGHT_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e2e8f0'/%3E%3Ccircle cx='24' cy='20' r='7' fill='%2394a3b8'/%3E%3C/svg%3E"
const DARK_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%231e293b'/%3E%3Ccircle cx='24' cy='20' r='7' fill='%2364748b'/%3E%3C/svg%3E"

export const Thumbnails: Story = {
  render: () => (
    <AttachmentList>
      <Attachment
        name="screenshot-light.png"
        size="96 KB"
        type="image"
        thumbnailUrl={LIGHT_THUMB}
      />
      <Attachment
        name="screenshot-dark.png"
        size="102 KB"
        type="image"
        thumbnailUrl={DARK_THUMB}
      />
    </AttachmentList>
  ),
}

const RemovableDemo = () => {
  const initial = [
    { name: 'auth-guard.ts', size: '4.2 KB' },
    { name: 'http-client.ts', size: '9.8 KB' },
    { name: 'trace.png', size: '218 KB' },
  ]
  const [files, setFiles] = React.useState(initial)

  return (
    <div className="flex flex-col gap-2">
      <AttachmentList>
        {files.map((file) => (
          <Attachment
            key={file.name}
            name={file.name}
            size={file.size}
            onRemove={() =>
              setFiles((prev) => prev.filter((item) => item.name !== file.name))
            }
          />
        ))}
      </AttachmentList>
      <button
        type="button"
        className="w-fit text-xs text-muted-foreground underline underline-offset-4"
        onClick={() => setFiles(initial)}
      >
        Reset
      </button>
    </div>
  )
}

export const Removable: Story = {
  render: () => <RemovableDemo />,
}

export const NameOverflow: Story = {
  render: () => (
    <AttachmentList>
      <Attachment
        name="a-very-long-generated-filename-that-should-be-truncated-instead-of-wrapping.tsx"
        size="12 KB"
      />
    </AttachmentList>
  ),
}
