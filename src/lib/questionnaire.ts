/**
 * Questionnaire maths — no React, no DOM.
 *
 * A questionnaire is a list of questions in, a record of answers out. Keeping
 * the shape and the rules here means the component is only rendering, and the
 * rules can be checked without mounting anything.
 */

export type QuestionType = 'single' | 'multiple' | 'scale' | 'rating' | 'text'

export interface QuestionOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface QuestionBase {
  id: string
  title: string
  description?: string
  /** Blocks submission until the question has an answer. */
  required?: boolean
}

export type Question =
  | (QuestionBase & { type: 'single'; options: QuestionOption[] })
  | (QuestionBase & { type: 'multiple'; options: QuestionOption[]; min?: number; max?: number })
  | (QuestionBase & {
      type: 'scale'
      min?: number
      max?: number
      /** Captions under the ends of the scale, e.g. "Not at all" / "Very much". */
      minLabel?: string
      maxLabel?: string
    })
  | (QuestionBase & { type: 'rating'; max?: number })
  | (QuestionBase & {
      type: 'text'
      multiline?: boolean
      placeholder?: string
      maxLength?: number
    })

export type QuestionAnswer = string | string[] | number | null | undefined
export type QuestionnaireAnswers = Record<string, QuestionAnswer>

export interface QuestionnaireMessages {
  /** `{n}` is replaced with the required count. */
  min?: string
  max?: string
}

export const QUESTIONNAIRE_DEFAULT_MESSAGES: Required<QuestionnaireMessages> = {
  min: 'Choose at least {n}',
  max: 'Choose at most {n}',
}

export const QUESTIONNAIRE_REQUIRED_MESSAGE = 'This question is required'

/** Scale bounds with the defaults filled in, so callers never have to guess. */
export function scaleBounds(question: Extract<Question, { type: 'scale' }>) {
  const min = question.min ?? 1
  const max = question.max ?? 5
  return { min, max, steps: Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i) }
}

/** A blank answer of the right type for the question. */
export function emptyAnswer(question: Question): QuestionAnswer {
  switch (question.type) {
    case 'multiple':
      return []
    case 'scale':
    case 'rating':
      return null
    default:
      return ''
  }
}

export function emptyAnswers(questions: Question[]): QuestionnaireAnswers {
  return Object.fromEntries(questions.map((question) => [question.id, emptyAnswer(question)]))
}

/**
 * Answered means "has a value a person chose" — a whitespace string and an
 * empty array are not answers, and `0` is (a scale can legitimately start at 0).
 */
export function isAnswered(answer: QuestionAnswer): boolean {
  if (answer === null || answer === undefined) return false
  if (typeof answer === 'string') return answer.trim().length > 0
  if (Array.isArray(answer)) return answer.length > 0
  return Number.isFinite(answer)
}

/**
 * The problems with a set of answers, keyed by question id. An empty object
 * means the questionnaire can be submitted.
 *
 * Only the rules the schema can decide live here — `required` and the `min` /
 * `max` count on a multiple-choice question. Anything domain-specific belongs
 * to the caller, which can merge its own errors into the `errors` prop.
 */
export function validateAnswers(
  questions: Question[],
  answers: QuestionnaireAnswers,
  messages: QuestionnaireMessages = {}
): Record<string, string> {
  const text = { ...QUESTIONNAIRE_DEFAULT_MESSAGES, ...messages }
  const errors: Record<string, string> = {}

  for (const question of questions) {
    const answer = answers[question.id]

    if (question.required && !isAnswered(answer)) {
      errors[question.id] = QUESTIONNAIRE_REQUIRED_MESSAGE
      continue
    }

    if (question.type === 'multiple' && Array.isArray(answer)) {
      if (question.min !== undefined && answer.length > 0 && answer.length < question.min) {
        errors[question.id] = text.min.replace('{n}', String(question.min))
      } else if (question.max !== undefined && answer.length > question.max) {
        errors[question.id] = text.max.replace('{n}', String(question.max))
      }
    }
  }

  return errors
}

export interface QuestionnaireProgress {
  answered: number
  total: number
  /** 0–100, and 100 for an empty questionnaire rather than NaN. */
  percent: number
}

export function questionnaireProgress(
  questions: Question[],
  answers: QuestionnaireAnswers
): QuestionnaireProgress {
  const total = questions.length
  const answered = questions.filter((question) => isAnswered(answers[question.id])).length

  return { answered, total, percent: total === 0 ? 100 : Math.round((answered / total) * 100) }
}

/** The first question that still needs an answer, for focusing after a failed submit. */
export function firstUnansweredId(
  questions: Question[],
  answers: QuestionnaireAnswers,
  errors: Record<string, string> = {}
): string | null {
  const failed = questions.find((question) => errors[question.id])
  if (failed) return failed.id

  return questions.find((question) => !isAnswered(answers[question.id]))?.id ?? null
}
