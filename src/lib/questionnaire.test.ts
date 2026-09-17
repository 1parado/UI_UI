import { describe, expect, it } from 'vitest'
import {
  emptyAnswers,
  firstUnansweredId,
  isAnswered,
  questionnaireProgress,
  scaleBounds,
  validateAnswers,
  type Question,
  type QuestionnaireAnswers,
} from './questionnaire'

type MultipleQuestion = Extract<Question, { type: 'multiple' }>

const multiple: MultipleQuestion = {
  id: 'tools',
  type: 'multiple',
  title: 'Tools',
  min: 1,
  max: 2,
  options: [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' },
  ],
}

const questions: Question[] = [
  { id: 'name', type: 'text', title: 'Your name', required: true },
  {
    id: 'plan',
    type: 'single',
    title: 'Plan',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
    ],
  },
  multiple,
  { id: 'score', type: 'scale', title: 'How likely', min: 0, max: 2 },
  { id: 'stars', type: 'rating', title: 'Stars' },
]

describe('isAnswered', () => {
  it('treats blank strings and empty arrays as unanswered', () => {
    expect(isAnswered('')).toBe(false)
    expect(isAnswered('   ')).toBe(false)
    expect(isAnswered([])).toBe(false)
    expect(isAnswered(null)).toBe(false)
    expect(isAnswered(undefined)).toBe(false)
  })

  it('counts a zero as an answer', () => {
    expect(isAnswered(0)).toBe(true)
    expect(isAnswered('0')).toBe(true)
  })
})

describe('emptyAnswers', () => {
  it('starts each question with the right empty shape', () => {
    expect(emptyAnswers(questions)).toEqual({
      name: '',
      plan: '',
      tools: [],
      score: null,
      stars: null,
    })
  })
})

describe('scaleBounds', () => {
  it('fills in a 1–5 default', () => {
    expect(scaleBounds({ id: 'q', type: 'scale', title: 'q' })).toMatchObject({ min: 1, max: 5 })
    expect(scaleBounds({ id: 'q', type: 'scale', title: 'q' }).steps).toEqual([1, 2, 3, 4, 5])
  })

  it('honours both bounds', () => {
    expect(scaleBounds({ id: 'q', type: 'scale', title: 'q', min: 0, max: 2 }).steps).toEqual([
      0, 1, 2,
    ])
  })

  it('produces nothing for an inverted range instead of throwing', () => {
    expect(scaleBounds({ id: 'q', type: 'scale', title: 'q', min: 5, max: 1 }).steps).toEqual([])
  })
})

describe('validateAnswers', () => {
  it('requires only what is marked required', () => {
    expect(validateAnswers(questions, emptyAnswers(questions))).toEqual({
      name: 'This question is required',
    })
  })

  it('passes once the required answer is present', () => {
    const answers: QuestionnaireAnswers = { ...emptyAnswers(questions), name: 'Ada' }
    expect(validateAnswers(questions, answers)).toEqual({})
  })

  it('leaves an untouched optional question alone, even below its minimum', () => {
    // `min` is a rule about a choice, not a demand to choose — that is what
    // `required` is for. So an empty list stays quiet on an optional question.
    expect(validateAnswers([multiple], { tools: [] })).toEqual({})
  })

  it('accepts a count inside the allowed range', () => {
    expect(validateAnswers([multiple], { tools: ['a'] })).toEqual({})
    expect(validateAnswers([multiple], { tools: ['a', 'b'] })).toEqual({})
  })

  it('enforces the maximum count', () => {
    expect(validateAnswers([multiple], { tools: ['a', 'b', 'c'] })).toEqual({
      tools: 'Choose at most 2',
    })
  })

  it('substitutes the count into the min message', () => {
    const messages = { min: 'Pick {n} or more' }
    expect(validateAnswers([{ ...multiple, min: 2 }], { tools: ['a'] }, messages)).toEqual({
      tools: 'Pick 2 or more',
    })
  })

  it('ignores answers to questions that are not in the list', () => {
    expect(validateAnswers([], { ghost: 'x' })).toEqual({})
  })
})

describe('questionnaireProgress', () => {
  it('counts answered questions', () => {
    const answers: QuestionnaireAnswers = { name: 'Ada', tools: ['a'] }
    expect(questionnaireProgress(questions, answers)).toEqual({ answered: 2, total: 5, percent: 40 })
  })

  it('is complete when there is nothing to answer', () => {
    expect(questionnaireProgress([], {})).toEqual({ answered: 0, total: 0, percent: 100 })
  })
})

describe('firstUnansweredId', () => {
  it('prefers a question that already failed validation', () => {
    expect(firstUnansweredId(questions, { name: 'Ada' }, { tools: 'nope' })).toBe('tools')
  })

  it('falls back to the first blank question', () => {
    expect(firstUnansweredId(questions, { name: 'Ada' })).toBe('plan')
  })

  it('reports nothing when everything is filled in', () => {
    const answers: QuestionnaireAnswers = {
      name: 'Ada',
      plan: 'pro',
      tools: ['a'],
      score: 2,
      stars: 5,
    }
    expect(firstUnansweredId(questions, answers)).toBeNull()
  })
})
