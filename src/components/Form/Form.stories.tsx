import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/Checkbox'
import { Input } from '@/components/Input'
import { NativeSelect } from '@/components/NativeSelect'
import { Switch } from '@/components/Switch'
import { Textarea } from '@/components/Textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './Form'

const meta = {
  title: 'Components/Form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Form primitives over react-hook-form. `FormItem` mints the ids and `FormControl` puts `id`, `aria-describedby` and `aria-invalid` on the control, so the label points at its input and the error is read with it. `react-hook-form` is re-exported, so consumers do not have to add it.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface SignUpValues {
  email: string
  password: string
  plan: string
  updates: boolean
}

const SignUp = () => {
  const form = useForm<SignUpValues>({
    defaultValues: { email: '', password: '', plan: 'pro', updates: true },
  })

  return (
    <Form {...form}>
      <form
        className="flex w-[380px] flex-col gap-6"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          console.log(values)
        })}
      >
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: 'We need an email to reach you',
            pattern: { value: /\S+@\S+\.\S+/, message: 'That does not look like an email' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="ada@example.com" {...field} />
              </FormControl>
              <FormDescription>Used for sign-in only.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{ required: 'Pick a password', minLength: { value: 8, message: 'At least 8 characters' } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
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
                <NativeSelect {...field}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="team">Team</option>
                </NativeSelect>
              </FormControl>
              <FormDescription>You can change this later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updates"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <div className="flex flex-col gap-0.5">
                <FormLabel className="font-normal">Product updates</FormLabel>
                <FormDescription>About once a month.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="self-start">
          Create account
        </Button>
      </form>
    </Form>
  )
}

export const SignUpForm: Story = {
  render: () => <SignUp />,
}

interface FeedbackValues {
  subject: string
  message: string
  notify: boolean
}

const Feedback = () => {
  const form = useForm<FeedbackValues>({
    defaultValues: { subject: '', message: '', notify: false },
  })

  return (
    <Form {...form}>
      <form className="flex w-[440px] flex-col gap-6" noValidate onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="subject"
          rules={{ required: 'A subject helps us route this' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          rules={{ required: 'Tell us what happened' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormDescription>Steps to reproduce help the most.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notify"
          render={({ field }) => (
            <FormItem className="flex-row items-center justify-between rounded-lg border border-border p-3">
              <div className="flex flex-col gap-0.5">
                <FormLabel className="font-normal">Email me the reply</FormLabel>
                <FormDescription>Only for this thread.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="self-start">
          Send feedback
        </Button>
      </form>
    </Form>
  )
}

/** Submit with everything empty to see the messages appear. */
export const WithErrors: Story = {
  render: () => <Feedback />,
}

const ServerError = () => {
  const form = useForm<{ handle: string }>({ defaultValues: { handle: 'ada' } })

  React.useEffect(() => {
    // An error that only the server knows about. `setError` takes a path that
    // matches the field name, so it lands on the right FormMessage.
    form.setError('handle', { type: 'server', message: 'That handle is already taken' })
  }, [form])

  return (
    <Form {...form}>
      <form className="flex w-[320px] flex-col gap-4" noValidate onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handle</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="self-start">
          Claim
        </Button>
      </form>
    </Form>
  )
}

/** A server error set imperatively with `form.setError`. */
export const ServerErrorSet: Story = {
  render: () => <ServerError />,
}
