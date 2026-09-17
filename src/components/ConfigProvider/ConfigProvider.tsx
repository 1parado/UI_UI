import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  type ConfigSize,
  type ConfigTheme,
  type LocaleMessages,
  enUS,
  mergeLocale,
} from '@/lib/config'

export interface Config {
  size: ConfigSize
  locale: LocaleMessages
  /** What `theme` resolved to, once "system" has been asked. */
  theme: ConfigTheme | undefined
  direction: 'ltr' | 'rtl' | undefined
}

export interface ConfigProviderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: React.ReactNode
  /**
   * Default size for controls that do not set one. Reading it is opt-in, via
   * `useConfig()` — nothing in this library changes shape behind your back.
   */
  size?: ConfigSize
  /** A full locale, or just the keys you want to change. */
  locale?: Partial<LocaleMessages>
  /**
   * Attach dark mode here rather than in a script that guesses at mount time.
   * `"system"` follows `prefers-color-scheme` and re-reads it if it flips.
   */
  theme?: ConfigTheme
  direction?: 'ltr' | 'rtl'
}

const defaults: Config = {
  size: 'md',
  locale: enUS,
  theme: undefined,
  direction: undefined,
}

const ConfigContext = React.createContext<Config>(defaults)

/**
 * App-wide defaults in one place.
 *
 * Two behaviours are worth knowing before you reach for it. **Sizing is
 * opt-in**: nothing here force-feeds a `size` prop into components that already
 * take one, because a component that ignores its own props is worse than one
 * with defaults. Wrap the app in this and read it back with `useConfig()` where
 * you want whole screens to agree. **Theming and direction are not** — they are
 * applied here, since those genuinely belong to the document.
 *
 * Nesting works the way you would hope: an inner provider inherits whatever it
 * did not set, and a partial `locale` replaces only the keys it mentions.
 *
 * ```tsx
 * <ConfigProvider theme="system" locale={zhCN} size="lg">
 *   <App />
 * </ConfigProvider>
 * ```
 */
function ConfigProvider({
  children,
  size,
  locale,
  theme,
  direction,
  className,
  ...props
}: ConfigProviderProps) {
  const parent = React.useContext(ConfigContext)
  const [systemDark, setSystemDark] = React.useState(false)

  React.useEffect(() => {
    if (theme !== 'system' || typeof window?.matchMedia !== 'function') return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(query.matches)

    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)

    return () => query.removeEventListener('change', onChange)
  }, [theme])

  // The class lives on `<html>` rather than a wrapper element: page background,
  // scrollbars and portalled overlays all read it from there. Whatever was on
  // it before is put back on unmount, so provider and page cannot fight.
  React.useEffect(() => {
    if (!theme) return

    const root = document.documentElement
    const had = root.classList.contains('dark')
    const dark = theme === 'dark' || (theme === 'system' && systemDark)

    root.classList.toggle('dark', dark)

    return () => {
      root.classList.toggle('dark', had)
    }
  }, [theme, systemDark])

  const value = React.useMemo<Config>(
    () => ({
      size: size ?? parent.size,
      locale: mergeLocale(parent.locale, locale),
      theme: theme ?? parent.theme,
      direction: direction ?? parent.direction,
    }),
    [parent, size, locale, theme, direction]
  )

  const tree = <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>

  // Only wrap when there is something for a wrapper to carry — a provider that
  // silently adds a div changes every flex and grid it sits inside.
  if (!direction && !className && Object.keys(props).length === 0) return tree

  return (
    <div dir={direction} className={cn(className)} {...props}>
      {tree}
    </div>
  )
}
ConfigProvider.displayName = 'ConfigProvider'

/** Everything currently in force. Falls back to the library defaults outside a provider. */
function useConfig(): Config {
  return React.useContext(ConfigContext)
}

/** Just the size. Use it for controls that accept one and should follow the page. */
function useConfigSize(): ConfigSize {
  return React.useContext(ConfigContext).size
}

/** The current message dictionary. Always complete, never a partial. */
function useLocale(): LocaleMessages {
  return React.useContext(ConfigContext).locale
}

export { ConfigProvider, useConfig, useConfigSize, useLocale }
