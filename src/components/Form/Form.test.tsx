import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/Input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './Form'

interface Values {
  email: string
  plan: string
}

const Demo = ({ onSubmit = () => {} }: { onSubmit?: (values: Values) => void }) => {
  const form = useForm<Values>({ defaultValues: { email: '', plan: '' } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>We never share it.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Send</button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  it('associates the label with the control', () => {
    render(<Demo />)

    // This is the whole point of FormLabel + FormControl: clicking the label
    // has to focus the input, which only works if `htmlFor` matches the id.
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox', { name: 'Email' }))
  })

  it('describes the control with its description text', () => {
    render(<Demo />)

    const input = screen.getByRole('textbox', { name: 'Email' })
    const describedBy = input.getAttribute('aria-describedby') ?? ''

    expect(describedBy).not.toBe('')
    expect(document.getElementById(describedBy.split(' ')[0])).toHaveTextContent(
      'We never share it.'
    )
  })

  it('shows the validation message and marks the control invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Demo onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('points the control at the message once there is one', async () => {
    const user = userEvent.setup()

    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const describedBy = screen.getByRole('textbox', { name: 'Email' }).getAttribute('aria-describedby') ?? ''
    const ids = describedBy.split(' ')

    // Both the description and the message, so a screen reader reads the hint
    // and then the error.
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[1])).toHaveTextContent('Email is required')
  })

  it('submits the values once they are valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Demo onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.com')
    await user.type(screen.getByRole('textbox', { name: 'Plan' }), 'pro')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', plan: 'pro' }, expect.anything())
  })

  it('clears the message as soon as the value is valid again', async () => {
    const user = userEvent.setup()

    render(<Demo />)
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.com')

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders nothing for a message when there is no error', () => {
    render(<Demo />)

    // FormMessage returns null rather than an empty paragraph, so a form with
    // no errors has no stray nodes in it.
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('throws when the field hook is used outside a FormField', () => {
    const Orphan = () => {
      useFormField()
      return null
    }
    const Wrapper = () => {
      const form = useForm()
      return (
        <Form {...form}>
          <Orphan />
        </Form>
      )
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Wrapper />)).toThrow(/within a <FormField>/)
    consoleError.mockRestore()
  })
})
