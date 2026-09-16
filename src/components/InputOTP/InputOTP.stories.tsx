import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './InputOTP'

const meta: Meta<typeof InputOTP> = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InputOTP>

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        {[0, 1, 2].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {[3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const FourDigits: Story = {
  render: () => (
    <InputOTP maxLength={4}>
      <InputOTPGroup>
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const Disabled: Story = {
  render: () => (
    <InputOTP maxLength={4} disabled value="1234">
      <InputOTPGroup>
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}

const OnCompleteExample = () => {
  const [code, setCode] = React.useState('')
  const [status, setStatus] = React.useState('Enter the six-digit code.')

  return (
    <div className="flex flex-col gap-3">
      <InputOTP
        maxLength={6}
        value={code}
        onChange={setCode}
        onComplete={(value) => setStatus(`Verifying ${value}…`)}
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {status}
      </p>
    </div>
  )
}

/** `onComplete` fires once the last slot is filled — the right place to submit. */
export const AutoSubmit: Story = { render: () => <OnCompleteExample /> }
