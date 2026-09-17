/**
 * Log level detection — what `LogViewer` uses to colour and filter a stream.
 *
 * Programs write levels in roughly a dozen shapes; rather than ask the caller
 * to tag every line, the level is read off the text when it is written the way
 * most loggers write it. A line that carries no level is left alone.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/** Least to most severe. Also the order the filter buttons are drawn in. */
export const LOG_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

/** Spelling variants that mean the same level. */
const ALIASES: Record<string, LogLevel> = {
  trace: 'trace',
  verbose: 'trace',
  debug: 'debug',
  info: 'info',
  information: 'info',
  notice: 'info',
  warn: 'warn',
  warning: 'warn',
  error: 'error',
  err: 'error',
  fatal: 'fatal',
  critical: 'fatal',
  crit: 'fatal',
  panic: 'fatal',
}

/**
 * Only the head of a line is searched: a word like "error" in the middle of a
 * message ("3 errors found") describes the message, it is not its level.
 */
const HEAD_LENGTH = 64
const LEVEL_IN_HEAD = /\b(trace|verbose|debug|info|information|notice|warn|warning|error|err|fatal|critical|crit|panic)\b/i

/**
 * The level a line declares, if any.
 *
 * `[ERROR]`, `level=error`, `2026-09-17T09:20:21Z WARN` and `ERROR:` all read
 * as their level. A level must be followed by a delimiter rather than a letter,
 * so `information` does not match `info` twice and `erroring` matches nothing.
 */
export function parseLogLevel(text: string): LogLevel | undefined {
  const head = text.slice(0, HEAD_LENGTH)
  const match = LEVEL_IN_HEAD.exec(head)
  if (!match) return undefined

  const word = match[1].toLowerCase()
  const after = head.charAt(match.index + match[0].length)
  if (after && /[a-z0-9]/i.test(after)) return undefined

  return ALIASES[word]
}

/** Counts per level, and the total, over a set of lines. */
export function countLevels(lines: string[]): Record<LogLevel | 'total', number> {
  const counts: Record<LogLevel | 'total', number> = {
    trace: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
    total: lines.length,
  }

  for (const line of lines) {
    const level = parseLogLevel(line)
    if (level) counts[level]++
  }

  return counts
}
