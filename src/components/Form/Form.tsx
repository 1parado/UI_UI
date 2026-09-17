import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/Label'

/**
 * Form primitives over `react-hook-form`.
 *
 * The value here is the wiring, not the state: `FormItem` mints the ids, and
 * `FormControl` puts `id`, `aria-describedby` and `aria-invalid` on whatever
 * control you render inside it, so a label actually points at its input and a
 * screen reader reads the error message with it. Doing that by hand is the part
 * everyone gets wrong once a form has more than three fields.
 *
 * `react-hook-form` is re-exported (`Form`, `useForm`, `useFormContext`,
 * `useWatch`, `useFieldArray`) so consumers do not have to add it themselves.
 */
const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * One controlled field. Wraps `Controller` so the render prop receives a
 * `field` whose `value`/`onChange`/`onBlur`/`ref` are already bound to the form.
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

/**
 * The ids and error state of the field around it. Throws when used outside a
 * `FormField`, because a label with no field is a bug worth surfacing loudly.
 */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext.name) {
    throw new Error('useFormField must be used within a <FormField>')
  }
  if (!itemContext.id) {
    throw new Error('useFormField must be used within a <FormItem>')
  }

  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = 'FormItem'

export type FormLabelProps = React.ComponentPropsWithoutRef<typeof Label>

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(error && 'text-destructive', className)}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

export type FormControlProps = React.ComponentPropsWithoutRef<typeof Slot>

/**
 * Wraps a single control and connects it to the label and the message. It is a
 * `Slot`, so the props land on the control you pass rather than on a wrapper
 * element that would break the label's association.
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  FormControlProps
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-xs text-muted-foreground', className)}
        {...props}
      />
    )
  }
)
FormDescription.displayName = 'FormDescription'

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error.message ?? '') : children

    if (!body) return null

    // `role="alert"` only for a real validation error — a static hint that
    // happens to live here should not interrupt a screen reader.
    return (
      <p
        ref={ref}
        id={formMessageId}
        role={error ? 'alert' : undefined}
        className={cn('text-xs font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
