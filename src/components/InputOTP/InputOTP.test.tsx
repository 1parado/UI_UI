import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from './InputOTP'

interface OtpTestProps {
  onComplete?: (value: string) => void
  pattern?: string
  disabled?: boolean
  value?: string
}

const renderOtp = (props: OtpTestProps = {}) =>
  render(
    <InputOTP maxLength={4} {...props}>
      <InputOTPGroup>
        {[0, 1, 2, 3].map((index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )

describe('InputOTP', () => {
  it('shows typed characters in their slots', async () => {
    const user = userEvent.setup()
    renderOtp()

    await user.type(screen.getByRole('textbox'), '12')

    expect(screen.getByRole('textbox')).toHaveValue('12')
  })

  it('fires onComplete once the last slot is filled', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderOtp({ onComplete })

    await user.type(screen.getByRole('textbox'), '1234')

    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('does not fire onComplete early', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderOtp({ onComplete })

    await user.type(screen.getByRole('textbox'), '123')

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('rejects characters outside the pattern', async () => {
    const user = userEvent.setup()
    renderOtp({ pattern: '^[0-9]+$' })

    await user.type(screen.getByRole('textbox'), 'ab12')

    expect(screen.getByRole('textbox')).toHaveValue('12')
  })

  it('ignores input while disabled', async () => {
    const user = userEvent.setup()
    renderOtp({ disabled: true, value: '9999' })

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()

    await user.type(input, '1')
    expect(input).toHaveValue('9999')
  })
})
