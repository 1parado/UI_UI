import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload, type UploadHandler } from './FileUpload'

afterEach(() => {
  vi.restoreAllMocks()
})

const makeFile = (name: string, type = 'text/plain', bytes = 'hello') =>
  new File([bytes], name, { type })

const zone = () => screen.getByRole('button', { name: /Drag files here/ })
const picker = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement

const rows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-upload-status]'))

/**
 * jsdom's `files` is a getter-only accessor, so it has to be defined rather
 * than assigned before the change event is dispatched.
 */
const choose = (container: HTMLElement, files: File[]) => {
  const input = picker(container)
  Object.defineProperty(input, 'files', { configurable: true, value: files })
  fireEvent.change(input)
}

const drop = (files: File[]) =>
  fireEvent.drop(zone(), { dataTransfer: { files } })

describe('FileUpload', () => {
  it('opens the file picker from the zone', async () => {
    const user = userEvent.setup()
    const { container } = render(<FileUpload />)
    const click = vi.spyOn(picker(container), 'click')

    await user.click(zone())

    expect(click).toHaveBeenCalled()
  })

  it('queues the files that were picked', () => {
    const { container } = render(<FileUpload />)

    choose(container, [makeFile('report.pdf', 'application/pdf')])

    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(rows(container)).toHaveLength(1)
  })

  it('queues the files that were dropped', () => {
    const { container } = render(<FileUpload />)

    drop([makeFile('a.png', 'image/png'), makeFile('b.png', 'image/png')])

    expect(rows(container)).toHaveLength(2)
  })

  it('marks the zone while something is dragged over it', () => {
    render(<FileUpload />)

    fireEvent.dragEnter(zone())
    expect(zone()).toHaveAttribute('data-dragging')

    fireEvent.dragLeave(zone())
    expect(zone()).not.toHaveAttribute('data-dragging')
  })

  it('reports a file size', () => {
    const { container } = render(<FileUpload />)

    choose(container, [makeFile('a.txt', 'text/plain', 'x'.repeat(2048))])

    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
  })

  it('shows a hint built from the limits', () => {
    render(<FileUpload accept="image/*,.pdf" maxSize={1024 * 1024} />)

    expect(screen.getByText('.pdf, image files · up to 1.0 MB')).toBeInTheDocument()
  })

  it('replaces the hint when one is given', () => {
    render(<FileUpload hint="PNG or JPG, up to 2 MB" />)

    expect(screen.getByText('PNG or JPG, up to 2 MB')).toBeInTheDocument()
  })

  it('keeps only one file when multiple is off', () => {
    const { container } = render(<FileUpload multiple={false} />)

    choose(container, [makeFile('a.txt'), makeFile('b.txt')])

    expect(rows(container)).toHaveLength(1)
    expect(screen.getByText('a.txt')).toBeInTheDocument()
  })

  it('turns the queue off', () => {
    const { container } = render(<FileUpload list={false} />)

    choose(container, [makeFile('a.txt')])

    expect(rows(container)).toHaveLength(0)
  })
})

describe('FileUpload validation', () => {
  it('rejects a file whose type is not accepted', () => {
    const onReject = vi.fn()
    const { container } = render(<FileUpload accept=".pdf" onReject={onReject} />)

    choose(container, [makeFile('notes.txt')])

    expect(onReject).toHaveBeenCalledWith([{ file: expect.any(File), reason: 'type' }])
    expect(container.querySelector('[data-upload-rejected]')).toHaveTextContent(
      '1 file rejected'
    )
    expect(screen.getByText(/notes.txt · wrong type/)).toBeInTheDocument()
    expect(rows(container)).toHaveLength(0)
  })

  it('rejects a file that is too large', () => {
    const onReject = vi.fn()
    const { container } = render(<FileUpload maxSize={4} onReject={onReject} />)

    choose(container, [makeFile('big.bin', 'application/octet-stream', 'x'.repeat(64))])

    expect(onReject).toHaveBeenCalledWith([{ file: expect.any(File), reason: 'size' }])
  })

  it('keeps what fits and rejects the rest once the queue is full', () => {
    const onReject = vi.fn()
    const { container } = render(<FileUpload maxFiles={2} onReject={onReject} />)

    choose(container, [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')])

    expect(rows(container)).toHaveLength(2)
    expect(onReject).toHaveBeenCalledWith([{ file: expect.any(File), reason: 'count' }])
  })

  it('counts what is already queued against the limit', () => {
    const onReject = vi.fn()
    const { container } = render(<FileUpload maxFiles={2} onReject={onReject} />)

    choose(container, [makeFile('a.txt'), makeFile('b.txt')])
    expect(rows(container)).toHaveLength(2)

    choose(container, [makeFile('c.txt')])

    expect(rows(container)).toHaveLength(2)
    expect(onReject).toHaveBeenLastCalledWith([{ file: expect.any(File), reason: 'count' }])
  })

  it('clears the rejection notice on the next accepted batch', () => {
    const { container } = render(<FileUpload accept=".pdf" />)

    choose(container, [makeFile('notes.txt')])
    expect(container.querySelector('[data-upload-rejected]')).toBeInTheDocument()

    choose(container, [makeFile('doc.pdf', 'application/pdf')])
    expect(container.querySelector('[data-upload-rejected]')).not.toBeInTheDocument()
  })

  it('ignores everything while disabled', () => {
    const { container } = render(<FileUpload disabled />)

    expect(zone()).toBeDisabled()

    choose(container, [makeFile('a.txt')])
    drop([makeFile('b.txt')])

    expect(rows(container)).toHaveLength(0)
  })
})

describe('FileUpload uploading', () => {
  it('leaves items pending when no upload handler is given', () => {
    const { container } = render(<FileUpload />)

    choose(container, [makeFile('a.txt')])

    expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'pending')
  })

  it('runs the handler and reports success', async () => {
    const upload = vi.fn<UploadHandler>()
    const onComplete = vi.fn()
    const { container } = render(<FileUpload upload={upload} onComplete={onComplete} />)

    choose(container, [makeFile('a.txt')])

    await waitFor(() => expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'success'))
    expect(upload).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ status: 'success', progress: 100 }))
  })

  it('passes a signal and reports progress', async () => {
    let seenSignal: AbortSignal | undefined
    // Left pending on purpose: the item has to sit in `uploading` long enough
    // to be observed, rather than racing to completion.
    const upload: UploadHandler = (_file, { onProgress, signal }) => {
      seenSignal = signal
      onProgress(40)
      return new Promise(() => {})
    }
    const { container } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt')])

    await waitFor(() => expect(seenSignal).toBeInstanceOf(AbortSignal))
    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
    )
    expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'uploading')
  })

  it('marks a failed upload and offers a retry', async () => {
    const user = userEvent.setup()
    const upload = vi
      .fn<UploadHandler>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(undefined)
    const { container } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt')])

    await waitFor(() => expect(screen.getByText('network down')).toBeInTheDocument())
    expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'error')

    await user.click(screen.getByRole('button', { name: 'Retry a.txt' }))

    await waitFor(() => expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'success'))
    expect(upload).toHaveBeenCalledTimes(2)
  })

  it('reports a rejection that is not an Error', async () => {
    const upload = vi.fn<UploadHandler>().mockRejectedValue('nope')
    const { container } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt')])

    await waitFor(() => expect(screen.getByText('Upload failed')).toBeInTheDocument())
  })

  it('uploads every accepted file', async () => {
    const upload = vi.fn<UploadHandler>()
    const { container } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt'), makeFile('b.txt')])

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
    // Both settle, not just the last one to report: each result is folded into
    // the queue rather than written over it.
    await waitFor(() =>
      expect(
        rows(container).every((row) => row.getAttribute('data-upload-status') === 'success')
      ).toBe(true)
    )
  })

  it('aborts the upload when its file is removed', async () => {
    const user = userEvent.setup()
    let seenSignal: AbortSignal | undefined
    const upload: UploadHandler = (_file, { signal }) => {
      seenSignal = signal
      return new Promise(() => {})
    }
    const { container } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt')])
    await waitFor(() => expect(seenSignal).toBeInstanceOf(AbortSignal))

    await user.click(screen.getByRole('button', { name: 'Remove a.txt' }))

    expect(seenSignal?.aborted).toBe(true)
    expect(rows(container)).toHaveLength(0)
  })

  it('aborts an in-flight upload when the component unmounts', async () => {
    let seenSignal: AbortSignal | undefined
    const upload: UploadHandler = (_file, { signal }) => {
      seenSignal = signal
      return new Promise(() => {})
    }
    const { container, unmount } = render(<FileUpload upload={upload} />)

    choose(container, [makeFile('a.txt')])
    await waitFor(() => expect(seenSignal).toBeInstanceOf(AbortSignal))

    unmount()

    expect(seenSignal?.aborted).toBe(true)
  })

  it('empties the queue', async () => {
    const { container } = render(<FileUpload />)

    choose(container, [makeFile('a.txt'), makeFile('b.txt')])
    await userEvent.click(screen.getByRole('button', { name: 'Remove all files' }))

    expect(rows(container)).toHaveLength(0)
  })
})

describe('FileUpload state', () => {
  it('reports the queue it holds', () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload onFilesChange={onFilesChange} />)

    choose(container, [makeFile('a.txt')])

    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({ status: 'pending', progress: 0 }),
    ])
  })

  it('leaves the queue to the caller when it is controlled', () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload files={[]} onFilesChange={onFilesChange} />)

    choose(container, [makeFile('a.txt')])

    expect(onFilesChange).toHaveBeenCalled()
    expect(rows(container)).toHaveLength(0)
  })

  it('starts from a queue given as a default', () => {
    const file = makeFile('seeded.txt')
    const { container } = render(
      <FileUpload defaultFiles={[{ id: 'seeded', file, status: 'success', progress: 100 }]} />
    )

    expect(rows(container)[0]).toHaveAttribute('data-upload-status', 'success')
    expect(screen.getByText('seeded.txt')).toBeInTheDocument()
  })

  it('replaces the wording when labels are given', () => {
    render(
      <FileUpload
        accept=".pdf"
        labels={{
          drop: '把文件拖到这里',
          browse: '或点击选择',
          wrongType: '格式不支持',
          rejected: (count) => `${count} 个文件被拒绝`,
        }}
      />
    )

    expect(screen.getByText('把文件拖到这里')).toBeInTheDocument()
    expect(screen.getByText('或点击选择')).toBeInTheDocument()
  })
})
