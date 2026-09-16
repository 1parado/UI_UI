import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './Toast'
import { Button } from '../Button'

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toast>

const DefaultExample = () => {
  const [open, setOpen] = React.useState(false)
  const timerRef = React.useRef(0)

  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <ToastProvider>
      <Button
        onClick={() => {
          setOpen(false)
          timerRef.current = window.setTimeout(() => setOpen(true), 100)
        }}
      >
        Add to calendar
      </Button>
      <Toast open={open} onOpenChange={setOpen}>
        <ToastTitle>Scheduled: Catch up</ToastTitle>
        <ToastDescription asChild>
          <time dateTime="2026-09-16T17:00">Today at 17:00 - 17:30</time>
        </ToastDescription>
        <ToastAction asChild altText="Schedule another event">
          <Button variant="outline" size="sm">
            Make another event
          </Button>
        </ToastAction>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

export const Default: Story = {
  render: () => <DefaultExample />,
}

const DestructiveExample = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <ToastProvider>
      <Button
        variant="destructive"
        onClick={() => {
          setOpen(false)
          window.setTimeout(() => setOpen(true), 100)
        }}
      >
        Delete file
      </Button>
      <Toast open={open} onOpenChange={setOpen} variant="destructive">
        <ToastTitle>Deletion failed</ToastTitle>
        <ToastDescription>
          The file is locked by another process. Try again later.
        </ToastDescription>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

export const Destructive: Story = {
  render: () => <DestructiveExample />,
}

const SuccessExample = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <ToastProvider>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(false)
          window.setTimeout(() => setOpen(true), 100)
        }}
      >
        Save changes
      </Button>
      <Toast open={open} onOpenChange={setOpen} variant="success">
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>
          Your changes have been published to production.
        </ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

export const Success: Story = {
  render: () => <SuccessExample />,
}
