import type { Meta, StoryObj } from '@storybook/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Accordion>

const FAQ = [
  {
    value: 'retry',
    question: 'Why does the retry keep returning 401?',
    answer:
      'The retry fires before the token refresh settles, so the request goes out with the expired access token. Await the refresh, then retry once.',
  },
  {
    value: 'quota',
    question: 'How is token quota calculated?',
    answer:
      'Input and output tokens are counted separately, then converted to credits at the model rate. Cached input tokens are billed at half rate.',
  },
  {
    value: 'export',
    question: 'Can I export a conversation?',
    answer:
      'Open the conversation menu and choose Export. Markdown is the default; JSON keeps tool calls and citations intact.',
  },
]

export const Single: Story = {
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="retry"
      className="w-[32rem]"
    >
      {FAQ.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

/** `type="multiple"` lets several sections stay open at once. */
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[32rem]">
      {FAQ.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[32rem]">
      <AccordionItem value="open">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>
          Invoices are issued on the first of each month.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="locked">
        <AccordionTrigger disabled>Team plan (owner only)</AccordionTrigger>
        <AccordionContent>Not visible to your role.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
