import type { Meta, StoryObj } from '@storybook/react'
import { Questionnaire } from './Questionnaire'
import type { Question } from '@/lib/questionnaire'

const meta = {
  title: 'Components/Questionnaire',
  component: Questionnaire,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A schema-driven form — questions in, answers out. Five question types, `required` and count validation from `lib/questionnaire`, and an `errors` prop for rules the schema cannot express. Use `Form` instead when the fields are heterogeneous and the data shape is a type you want typed end to end.',
      },
    },
  },
  args: { questions: [] },
} satisfies Meta<typeof Questionnaire>

export default meta
type Story = StoryObj<typeof meta>

const onboarding: Question[] = [
  {
    id: 'name',
    type: 'text',
    title: 'What should we call you?',
    required: true,
    placeholder: 'Ada Lovelace',
  },
  {
    id: 'role',
    type: 'single',
    title: 'What do you do?',
    required: true,
    options: [
      { value: 'eng', label: 'Engineering', description: 'Backend, frontend, infra' },
      { value: 'design', label: 'Design', description: 'Product, brand, research' },
      { value: 'pm', label: 'Product' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'tools',
    type: 'multiple',
    title: 'Which tools do you use?',
    description: 'Pick up to two — we will seed your workspace with them.',
    min: 1,
    max: 2,
    options: [
      { value: 'vscode', label: 'VS Code' },
      { value: 'jetbrains', label: 'JetBrains' },
      { value: 'vim', label: 'Vim / Neovim' },
      { value: 'zed', label: 'Zed' },
    ],
  },
  {
    id: 'effort',
    type: 'text',
    title: 'How big is the codebase?',
    multiline: true,
    placeholder: 'A sentence or two is plenty',
  },
]

export const Default: Story = {
  render: () => (
    <Questionnaire
      className="w-[520px]"
      questions={onboarding}
      title="Tell us about your setup"
      description="Two minutes, and we will tune the defaults for you."
      submitLabel="Continue"
      onSubmit={() => {}}
    />
  ),
}

const survey: Question[] = [
  {
    id: 'likelihood',
    type: 'scale',
    title: 'How likely are you to recommend us?',
    description: '0 is not at all likely, 10 is extremely likely.',
    required: true,
    min: 0,
    max: 10,
    minLabel: 'Not at all',
    maxLabel: 'Very likely',
  },
  { id: 'stars', type: 'rating', title: 'How would you rate the editor?', required: true },
  {
    id: 'best',
    type: 'multiple',
    title: 'What worked well?',
    options: [
      { value: 'speed', label: 'It felt fast' },
      { value: 'docs', label: 'The docs' },
      { value: 'support', label: 'Support' },
    ],
  },
  { id: 'notes', type: 'text', title: 'Anything else?', multiline: true },
]

/** Scale and rating questions, which is most of a survey. */
export const Survey: Story = {
  render: () => (
    <Questionnaire
      className="w-[520px]"
      questions={survey}
      title="How did we do?"
      submitLabel="Send feedback"
      onSubmit={() => {}}
    />
  ),
}

/** `validationMode="always"` flags a question as soon as it is touched. */
export const ValidateAsYouGo: Story = {
  render: () => (
    <Questionnaire
      className="w-[520px]"
      questions={onboarding}
      validationMode="always"
      submitLabel="Continue"
      onSubmit={() => {}}
    />
  ),
}

/**
 * Caller-supplied errors — for rules the schema cannot express, like a handle
 * that is already taken. They merge over the built-in checks and always win.
 */
export const WithCallerErrors: Story = {
  render: () => (
    <Questionnaire
      className="w-[420px]"
      questions={[
        { id: 'handle', type: 'text', title: 'Choose a handle', required: true },
        {
          id: 'size',
          type: 'single',
          title: 'Team size',
          options: [
            { value: '1', label: 'Just me' },
            { value: '2-10', label: '2–10' },
          ],
        },
      ]}
      errors={{ handle: 'That handle is already taken' }}
      submitLabel="Create account"
      onSubmit={() => {}}
    />
  ),
}

export const WithoutProgress: Story = {
  render: () => (
    <Questionnaire
      className="w-[420px]"
      questions={onboarding.slice(0, 2)}
      showProgress={false}
      submitLabel="Save"
      onSubmit={() => {}}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <Questionnaire className="w-[420px]" questions={[]} submitLabel="Nothing to answer" />
  ),
}

export const Disabled: Story = {
  render: () => (
    <Questionnaire className="w-[420px]" questions={onboarding.slice(0, 3)} disabled />
  ),
}
