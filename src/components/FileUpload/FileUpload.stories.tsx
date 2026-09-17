import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload, type UploadHandler, type UploadItem } from './FileUpload'

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FileUpload>

/** A queue that does not start: add files and they sit at `pending`. */
export const Default: Story = {
  args: { className: 'w-[420px]' },
}

/**
 * The handler owns the transfer and reports progress. It has to honour the
 * signal — the component aborts it when the file is removed or the page moves
 * on — which is what the `abort` listener here is for.
 */
const slowUpload: UploadHandler = (_file, { onProgress, signal }) =>
  new Promise<void>((resolve, reject) => {
    let percent = 0
    const timer = window.setInterval(() => {
      percent += 20
      onProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        resolve()
      }
    }, 220)

    signal.addEventListener('abort', () => {
      window.clearInterval(timer)
      reject(new Error('Aborted'))
    })
  })

export const WithProgress: Story = {
  args: { className: 'w-[420px]', upload: slowUpload },
}

/**
 * Fails the first attempt at each file, then succeeds — so the retry path is
 * reachable by hand. The attempt count lives outside the handler because each
 * retry gets a fresh call.
 */
const attempts = new Map<string, number>()

const flakyUpload: UploadHandler = (file, { onProgress, signal }) => {
  const seen = (attempts.get(file.name) ?? 0) + 1
  attempts.set(file.name, seen)

  let percent = 0

  return new Promise<void>((resolve, reject) => {
    const timer = window.setInterval(() => {
      percent += 25
      onProgress(percent)
      if (percent < 100) return

      window.clearInterval(timer)
      if (seen === 1) reject(new Error('503 from the upload endpoint'))
      else resolve()
    }, 200)

    signal.addEventListener('abort', () => {
      window.clearInterval(timer)
      reject(new Error('Aborted'))
    })
  })
}

export const FailuresAndRetry: Story = {
  args: { className: 'w-[420px]', upload: flakyUpload },
}

/** The same rules the drop zone applies to a folder dropped onto it. */
export const Constrained: Story = {
  args: {
    className: 'w-[420px]',
    accept: 'image/*,.pdf',
    maxSize: 2 * 1024 * 1024,
    maxFiles: 3,
    upload: slowUpload,
  },
}

export const SingleFile: Story = {
  args: { className: 'w-[420px]', multiple: false, accept: 'application/pdf' },
}

export const Disabled: Story = {
  args: { className: 'w-[420px]', disabled: true, defaultFiles: [] },
}

const ControlledDemo = () => {
  const [files, setFiles] = React.useState<UploadItem[]>([])

  return (
    <div className="w-[420px] space-y-2">
      <FileUpload files={files} onFilesChange={setFiles} />
      <p className="text-xs text-muted-foreground">{files.length} file(s) held by the caller</p>
    </div>
  )
}

/** The queue can be owned from outside, like every other controlled part. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const WithoutQueue: Story = {
  args: { className: 'w-[420px]', list: false },
}

export const Localised: Story = {
  args: {
    className: 'w-[420px]',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    labels: {
      drop: '把文件拖到这里',
      browse: '或点击选择文件',
      tooLarge: '超过大小限制',
      wrongType: '格式不支持',
      tooMany: '超出数量限制',
      rejected: (count) => `${count} 个文件被拒绝`,
      remove: (name) => `移除 ${name}`,
      retry: (name) => `重新上传 ${name}`,
      clearAll: '清空全部',
    },
    upload: slowUpload,
  },
}
