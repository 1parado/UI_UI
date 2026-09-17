import * as React from 'react'
import { cn } from '@/lib/utils'
import { useControllableState } from '@/lib/use-controllable-state'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/Checkbox'
import { Input } from '@/components/Input'
import { Label } from '@/components/Label'
import { Progress } from '@/components/Progress'
import { Radio, RadioGroup } from '@/components/RadioGroup'
import { Rating } from '@/components/Rating'
import { Textarea } from '@/components/Textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ToggleGroup'
import {
  emptyAnswers,
  firstUnansweredId,
  questionnaireProgress,
  scaleBounds,
  validateAnswers,
  type Question,
  type QuestionnaireAnswers,
  type QuestionnaireMessages,
} from '@/lib/questionnaire'

export interface QuestionnaireLabels {
  /** `{answered}` and `{total}` are substituted. */
  progress?: string
  /** Read out after a required question's title. */
  required?: string
  /** Announced as the submit button's busy/complete caption when everything is filled in. */
  complete?: string
}

const defaultLabels: Required<QuestionnaireLabels> = {
  progress: '{answered} of {total} answered',
  required: 'required',
  complete: 'All questions answered',
}

export interface QuestionnaireProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    'onSubmit' | 'onChange' | 'title' | 'defaultValue'
  > {
  questions: Question[]
  /** Controlled answers. Omit to let the questionnaire own them. */
  value?: QuestionnaireAnswers
  defaultValue?: QuestionnaireAnswers
  onValueChange?: (answers: QuestionnaireAnswers) => void
  /** Called with the answers once validation passes. */
  onSubmit?: (answers: QuestionnaireAnswers) => void
  /**
   * Errors from the caller, keyed by question id — merged over the built-in
   * checks, for rules the schema cannot express ("that handle is taken").
   */
  errors?: Record<string, string>
  /** Overrides for the min/max count messages built from the schema. */
  messages?: QuestionnaireMessages
  /**
   * `onSubmit` keeps the form quiet until the first submit attempt, which is
   * what a long form wants. `always` flags a field as soon as it is touched.
   */
  validationMode?: 'onSubmit' | 'always'
  disabled?: boolean
  showProgress?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  submitLabel?: string
  /** Rendered between the last question and the submit button. */
  children?: React.ReactNode
  labels?: QuestionnaireLabels
}

/**
 * A schema-driven form — questions in, answers out.
 *
 * The questions are data: five types (`single`, `multiple`, `scale`, `rating`,
 * `text`) covering what surveys and intake forms actually ask, with `required`
 * and per-question min/max counts validated by `lib/questionnaire`. Anything
 * that needs a bespoke rule gets it through `errors`, so the component never
 * has to grow a rule engine.
 *
 * Reach for `Form` instead when the shape of the data is a TypeScript type you
 * want typed end to end and the fields are heterogeneous — this one trades that
 * for being renderable from a payload you did not write.
 *
 * ```tsx
 * <Questionnaire
 *   questions={survey}
 *   onSubmit={(answers) => save(answers)}
 *   submitLabel="Send"
 * />
 * ```
 */
const Questionnaire = React.forwardRef<HTMLFormElement, QuestionnaireProps>(
  (
    {
      className,
      questions,
      value,
      defaultValue,
      onValueChange,
      onSubmit,
      errors,
      messages,
      validationMode = 'onSubmit',
      disabled = false,
      showProgress = true,
      title,
      description,
      submitLabel = 'Submit',
      children,
      labels,
      ...props
    },
    ref
  ) => {
    const text = { ...defaultLabels, ...labels }
    const uid = React.useId()
    const formRef = React.useRef<HTMLFormElement | null>(null)

    const [answers, setAnswers] = useControllableState<QuestionnaireAnswers>({
      value,
      defaultValue: defaultValue ?? emptyAnswers(questions),
      onValueChange,
    })
    const [submitted, setSubmitted] = React.useState(false)

    // A callback ref rather than a merged one: `ref` may be a function or an
    // object, and the focus-on-error path needs the node either way.
    const setFormRef = React.useCallback(
      (node: HTMLFormElement | null) => {
        formRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.RefObject<HTMLFormElement | null>).current = node
      },
      [ref]
    )

    const computedErrors = React.useMemo(
      () => validateAnswers(questions, answers, messages),
      [questions, answers, messages]
    )

    // The caller's errors always win — they know things the schema does not.
    const allErrors = React.useMemo(
      () => (errors ? { ...computedErrors, ...errors } : computedErrors),
      [computedErrors, errors]
    )

    const shownErrors = React.useMemo(() => {
      if (validationMode === 'always' || submitted) return allErrors
      // Errors handed in from outside are already an answer — an async check
      // that came back "taken" should not wait for a submit to be seen.
      return errors ? allErrors : {}
    }, [allErrors, errors, validationMode, submitted])

    const progress = questionnaireProgress(questions, answers)

    const setAnswer = (id: string, next: QuestionnaireAnswers[string]) =>
      setAnswers((previous) => ({ ...previous, [id]: next }))

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitted(true)

      if (Object.keys(allErrors).length > 0) {
        // Focus the first question that needs attention rather than leaving the
        // caret wherever it was — the failing field may be off screen.
        const id = firstUnansweredId(questions, answers, allErrors)
        const field = formRef.current?.querySelector<HTMLElement>(`[data-question-id="${id}"]`)
        const target = field?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), textarea, button, [tabindex]:not([tabindex="-1"])'
        )
        target?.focus()
        return
      }

      onSubmit?.(answers)
    }

    return (
      <form
        noValidate
        data-slot="questionnaire"
        className={cn('flex w-full flex-col gap-6', className)}
        {...props}
        ref={setFormRef}
        onSubmit={handleSubmit}
      >
        {(title || description) && (
          <header className="flex flex-col gap-1">
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </header>
        )}

        {showProgress && progress.total > 0 && (
          <div className="flex flex-col gap-1.5">
            <Progress value={progress.percent} />
            <p className="text-xs text-muted-foreground">
              {progress.percent === 100
                ? text.complete
                : text.progress
                    .replace('{answered}', String(progress.answered))
                    .replace('{total}', String(progress.total))}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {questions.map((question) => {
            const answer = answers[question.id]
            const error = shownErrors[question.id]
            const errorId = `${uid}-${question.id}-error`

            return (
              <fieldset
                key={question.id}
                data-question-id={question.id}
                data-invalid={error ? true : undefined}
                className="flex flex-col gap-2"
              >
                <legend className="text-sm font-medium text-foreground">
                  {question.title}
                  {question.required && (
                    <>
                      <span aria-hidden className="ml-0.5 text-destructive">
                        *
                      </span>
                      <span className="sr-only"> ({text.required})</span>
                    </>
                  )}
                </legend>

                {question.description && (
                  <p className="text-xs text-muted-foreground">{question.description}</p>
                )}

                <div
                  aria-describedby={error ? errorId : undefined}
                  aria-invalid={error ? true : undefined}
                >
                  {question.type === 'single' && (
                    <RadioGroup
                      value={typeof answer === 'string' ? answer : ''}
                      onValueChange={(next) => setAnswer(question.id, next)}
                      disabled={disabled}
                      className="gap-2"
                    >
                      {question.options.map((option) => {
                        const optionId = `${uid}-${question.id}-${option.value}`
                        return (
                          <div key={option.value} className="flex items-start gap-2">
                            <Radio
                              id={optionId}
                              value={option.value}
                              disabled={disabled || option.disabled}
                              className="mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5">
                              <Label htmlFor={optionId} className="font-normal">
                                {option.label}
                              </Label>
                              {option.description && (
                                <p className="text-xs text-muted-foreground">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  )}

                  {question.type === 'multiple' && (
                    <div className="flex flex-col gap-2">
                      {question.options.map((option) => {
                        const optionId = `${uid}-${question.id}-${option.value}`
                        const selected = Array.isArray(answer) ? answer : []
                        const checked = selected.includes(option.value)
                        return (
                          <div key={option.value} className="flex items-start gap-2">
                            <Checkbox
                              id={optionId}
                              checked={checked}
                              disabled={disabled || option.disabled}
                              className="mt-0.5"
                              onCheckedChange={(next) =>
                                setAnswer(
                                  question.id,
                                  next === true
                                    ? [...selected, option.value]
                                    : selected.filter((entry) => entry !== option.value)
                                )
                              }
                            />
                            <div className="flex flex-col gap-0.5">
                              <Label htmlFor={optionId} className="font-normal">
                                {option.label}
                              </Label>
                              {option.description && (
                                <p className="text-xs text-muted-foreground">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {question.type === 'scale' && (
                    <div className="flex flex-col gap-1.5">
                      <ToggleGroup
                        type="single"
                        disabled={disabled}
                        value={answer === null || answer === undefined ? '' : String(answer)}
                        onValueChange={(next) =>
                          setAnswer(question.id, next === '' ? null : Number(next))
                        }
                        className="w-fit"
                      >
                        {scaleBounds(question).steps.map((step) => (
                          <ToggleGroupItem
                            key={step}
                            value={String(step)}
                            aria-label={String(step)}
                            className="min-w-9 tabular-nums"
                          >
                            {step}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      {(question.minLabel || question.maxLabel) && (
                        <div className="flex w-fit justify-between gap-2 text-xs text-muted-foreground">
                          <span>{question.minLabel}</span>
                          <span>{question.maxLabel}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <Rating
                      size="lg"
                      disabled={disabled}
                      max={question.max}
                      // The legend makes the fieldset a group; the slider inside
                      // still needs its own name.
                      aria-label={question.title}
                      value={typeof answer === 'number' ? answer : 0}
                      onValueChange={(next) => setAnswer(question.id, next)}
                    />
                  )}

                  {question.type === 'text' &&
                    (question.multiline ? (
                      <Textarea
                        aria-label={question.title}
                        value={typeof answer === 'string' ? answer : ''}
                        placeholder={question.placeholder}
                        maxLength={question.maxLength}
                        disabled={disabled}
                        invalid={Boolean(error)}
                        onChange={(event) => setAnswer(question.id, event.target.value)}
                      />
                    ) : (
                      <Input
                        aria-label={question.title}
                        value={typeof answer === 'string' ? answer : ''}
                        placeholder={question.placeholder}
                        maxLength={question.maxLength}
                        disabled={disabled}
                        invalid={Boolean(error)}
                        onChange={(event) => setAnswer(question.id, event.target.value)}
                      />
                    ))}
                </div>

                {error && (
                  <p id={errorId} role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                )}
              </fieldset>
            )
          })}
        </div>

        {children}

        <Button type="submit" disabled={disabled} className="self-start">
          {submitLabel}
        </Button>
      </form>
    )
  }
)
Questionnaire.displayName = 'Questionnaire'

export { Questionnaire }
