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

  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
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
