import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Questionnaire } from './Questionnaire'
import type { Question } from '@/lib/questionnaire'

const questions: Question[] = [
  { id: 'name', type: 'text', title: 'Your name', required: true, placeholder: 'Ada' },
  {
    id: 'plan',
    type: 'single',
    title: 'Plan',
    required: true,
    options: [
      { value: 'free', label: 'Free', description: 'For side projects' },
      { value: 'pro', label: 'Pro' },
    ],
  },
  {
    id: 'tools',
    type: 'multiple',
    title: 'Tools',
    options: [
      { value: 'vscode', label: 'VS Code' },
      { value: 'vim', label: 'Vim' },
    ],
  },
  { id: 'score', type: 'scale', title: 'How likely', min: 1, max: 3 },
  { id: 'stars', type: 'rating', title: 'Stars' },
]

const submit = () => screen.getByRole('button', { name: 'Submit' })

describe('Questionnaire', () => {
  it('renders each question as a named group', () => {
    render(<Questionnaire questions={questions} />)

    expect(screen.getByRole('group', { name: /Your name/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Plan/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /How likely/ })).toBeInTheDocument()
  })

  it('blocks submission while a required answer is missing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Questionnaire questions={questions} onSubmit={onSubmit} />)
    await user.click(submit())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(screen.getAllByText('This question is required')).toHaveLength(2)
  })

  it('moves focus to the first question that needs attention', async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} onSubmit={vi.fn()} />)
    await user.click(submit())

    // The failing field may be off screen, so focus is the only way to get the
    // caret there without scrolling blind.
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveFocus()
  })

  it('stays quiet until the first submit attempt', async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('textbox', { name: 'Your name' }))
    await user.tab()

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('clears a question error as soon as it is answered', async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} onSubmit={vi.fn()} />)
    await user.click(submit())
    expect(screen.getAllByRole('alert')).toHaveLength(2)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')
    await user.click(screen.getByRole('radio', { name: 'Pro' }))

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('hands the answers to onSubmit once everything required is filled in', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Questionnaire questions={questions} onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')
    await user.click(screen.getByRole('radio', { name: 'Pro' }))
    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada', plan: 'pro', tools: [], score: null, stars: null })
    )
  })

  it('collects each question type', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Questionnaire questions={questions} onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')
    await user.click(screen.getByRole('radio', { name: 'Free' }))
    await user.click(screen.getByRole('checkbox', { name: 'Vim' }))
    await user.click(screen.getByRole('radio', { name: '3' }))

    const stars = screen.getByRole('slider', { name: 'Stars' })
    stars.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ada',
      plan: 'free',
      tools: ['vim'],
      score: 3,
      stars: 2,
    })
  })

  it('unchecks a multiple-choice option that is clicked again', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Questionnaire questions={questions} onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')
    await user.click(screen.getByRole('radio', { name: 'Free' }))

    const vim = screen.getByRole('checkbox', { name: 'Vim' })
    await user.click(vim)
    await user.click(vim)
    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tools: [] }))
  })

  it('reports progress as questions are answered', async () => {
    const user = userEvent.setup()

    render(<Questionnaire questions={questions} />)

    expect(screen.getByText('0 of 5 answered')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')

    expect(screen.getByText('1 of 5 answered')).toBeInTheDocument()
  })

  it('says so when there is nothing left to answer', async () => {
    const user = userEvent.setup()

    render(
      <Questionnaire
        questions={[{ id: 'name', type: 'text', title: 'Your name' }]}
        showProgress
      />
    )

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')

    expect(screen.getByText('All questions answered')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('can hide the progress readout', () => {
    render(<Questionnaire questions={questions} showProgress={false} />)

    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('leaves the answers to the caller when controlled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<Questionnaire questions={questions} value={{}} onValueChange={onValueChange} />)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'A')

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'A' }))
    // Controlled: the input keeps showing the value it was given.
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveValue('')
  })

  it('shows the caller errors, which win over the built-in ones', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Questionnaire
        questions={[{ id: 'name', type: 'text', title: 'Your name' }]}
        errors={{ name: 'That handle is taken' }}
        onSubmit={onSubmit}
      />
    )

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'ada')
    await user.click(submit())

    expect(screen.getByRole('alert')).toHaveTextContent('That handle is taken')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits even with caller errors once they are gone', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const { rerender } = render(
      <Questionnaire
        questions={[{ id: 'name', type: 'text', title: 'Your name' }]}
        defaultValue={{ name: 'ada' }}
        errors={{ name: 'That handle is taken' }}
        onSubmit={onSubmit}
      />
    )

    rerender(
      <Questionnaire
        questions={[{ id: 'name', type: 'text', title: 'Your name' }]}
        defaultValue={{ name: 'ada' }}
        errors={{}}
        onSubmit={onSubmit}
      />
    )

    await user.click(submit())

    expect(onSubmit).toHaveBeenCalledWith({ name: 'ada' })
  })

  it('flags as you go in always mode', async () => {
    const user = userEvent.setup()

    render(
      <Questionnaire
        questions={[{ id: 'name', type: 'text', title: 'Your name', required: true }]}
        validationMode="always"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This question is required')

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disables every control and the submit button', () => {
    render(<Questionnaire questions={questions} disabled />)

    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Free' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Vim' })).toBeDisabled()
    expect(submit()).toBeDisabled()
  })

  it('takes a custom submit label and title', () => {
    render(<Questionnaire questions={questions} title="Onboarding" submitLabel="Send" />)

    expect(screen.getByRole('heading', { name: 'Onboarding' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('substitutes the counts into a custom progress label', async () => {
    const user = userEvent.setup()

    render(
      <Questionnaire
        questions={questions}
        labels={{ progress: '{answered}/{total}' }}
      />
    )

    expect(screen.getByText('0/5')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ada')

    expect(screen.getByText('1/5')).toBeInTheDocument()
  })
})
