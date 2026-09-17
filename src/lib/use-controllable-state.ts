import * as React from 'react'

/**
 * Controllable state — the contract Radix uses everywhere else in the library:
 * pass `value` to own it, or `defaultValue` to let the component hold it.
 * Passing neither is also fine; the component starts from `defaultValue` and
 * keeps its own state, which is what a one-off template needs.
 *
 * Extracted from `Combobox`, where this was written twice (once for the single
 * picker and once for the multi picker) before the third and fourth components
 * needed the same pair of `useState` and callback.
 *
 * `setValue` also takes an updater function, like `useState`'s setter. That is
 * not sugar: a component with several async jobs in flight (an upload queue)
 * has to fold each result into the latest value, and reading the value from the
 * render scope loses whichever result landed in the same batch.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: T
  defaultValue: T
  onValueChange?: (value: T) => void
}) {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const current = value === undefined ? internal : value

  // Read through a ref so that `setValue` stays stable no matter how often the
  // value changes — an updater inside an in-flight async job (an upload
  // reporting progress, say) must not be rebuilt on every render.
  const currentRef = React.useRef(current)
  currentRef.current = current

  const setValue = React.useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolve = (previous: T) =>
        typeof next === 'function' ? (next as (previous: T) => T)(previous) : next

      // The updater goes to `useState` itself, not through the ref: two results
      // landing in the same batch (two uploads finishing together) must each be
      // folded into the other, and only `useState` knows about the queue.
      if (value === undefined) setInternal(resolve)
      onValueChange?.(resolve(currentRef.current))
    },
    [value, onValueChange]
  )

  return [current, setValue] as const
}

/** `useControllableState` for a string that starts empty. */
export function useControllableString(options: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  return useControllableState<string>({
    ...options,
    defaultValue: options.defaultValue ?? '',
  })
}

/** `useControllableState` for a list of strings that starts empty. */
export function useControllableStringArray(options: {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}) {
  return useControllableState<string[]>({
    ...options,
    defaultValue: options.defaultValue ?? [],
  })
}

/** `useControllableState` for a number that starts at `defaultValue ?? 0`. */
export function useControllableNumber(options: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}) {
  return useControllableState<number>({
    ...options,
    defaultValue: options.defaultValue ?? 0,
  })
}
