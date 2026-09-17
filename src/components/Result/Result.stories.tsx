import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/Button'
import { Result } from './Result'

const meta = {
  title: 'Components/Result',
  component: Result,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The end of a flow: a payment went through, a link is dead, a save failed. It is a **block, not a page** — it sets no height and takes over no document title, so it drops into whatever layout you already have. `status` picks the icon and its colour; it says nothing about what happened, so choose the one that matches the outcome the reader should understand.',
      },
    },
  },
  args: { status: 'success', title: 'Payment received' },
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info', '404', '403', '500'],
    },
  },
} satisfies Meta<typeof Result>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    status: 'success',
    title: 'Payment received',
    subTitle: 'A receipt is on its way to you@example.com.',
    extra: <Button variant="outline">Back to dashboard</Button>,
  },
}

export const Error: Story = {
  args: {
    status: 'error',
    title: 'The payment could not be processed',
    subTitle: 'Your card was declined. Nothing has been charged.',
    extra: (
      <>
        <Button>Try another card</Button>
        <Button variant="outline">Contact support</Button>
      </>
    ),
  },
}

export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'Some settings could not be saved',
    subTitle: 'Two fields are still invalid. Everything else was stored.',
  },
}

export const Info: Story = {
  args: {
    status: 'info',
    title: 'Your export is queued',
    subTitle: 'We will email you a link when it is ready.',
  },
}

export const NotFound: Story = {
  args: {
    status: '404',
    title: 'There is no such page',
    subTitle: 'The link may be out of date, or the page was moved.',
    extra: <Button variant="outline">Go home</Button>,
  },
}

export const Forbidden: Story = {
  args: {
    status: '403',
    title: 'You do not have access',
    subTitle: 'Ask an owner of this workspace for permission.',
  },
}

export const ServerError: Story = {
  args: {
    status: '500',
    title: 'Something broke on our side',
    subTitle: 'We have been notified. Trying again usually helps.',
    extra: <Button>Try again</Button>,
  },
}

/** The presets cover the common outcomes; anything else brings its own icon. */
export const WithACustomIcon: Story = {
  args: {
    status: 'info',
    title: 'Waiting for approval',
    subTitle: 'A reviewer will look at this shortly.',
    icon: <span className="text-2xl">⏳</span>,
  },
}

/** Extra content sits between the text and the actions. */
export const WithDetails: Story = {
  args: {
    status: 'error',
    title: 'Deployment failed',
    subTitle: 'The build finished with 3 errors.',
    children: (
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-left text-xs">
        {`src/app.tsx(12,5): error TS2322
src/app.tsx(40,9): error TS2322
src/lib/api.ts(7,3): error TS2345`}
      </pre>
    ),
    extra: <Button variant="outline">Open build log</Button>,
  },
}
