import { describe, expect, it } from 'vitest'
import {
  activeMention,
  applyMention,
  matchMentions,
  nextActiveIndex,
  type MentionOption,
} from './mentions'

describe('activeMention', () => {
  it('reads the mention the caret sits in', () => {
    expect(activeMention('hi @ad', 6)).toEqual({ start: 3, query: 'ad' })
  })

  it('matches nothing without a trigger', () => {
    expect(activeMention('hi ada', 6)).toBeNull()
  })

  it('demands whitespace before the trigger', () => {
    expect(activeMention('mail me@ad', 10)).toBeNull()
    expect(activeMention('@ad', 3)).toEqual({ start: 0, query: 'ad' })
  })

  it('stops at a second trigger', () => {
    expect(activeMention('@@ weird @jo', 12)).toEqual({ start: 9, query: 'jo' })
  })

  it('ends the query at whitespace', () => {
    expect(activeMention('@ada can you', 12)).toBeNull()
  })

  it('allows spaces inside the query when asked', () => {
    expect(activeMention('@Ada Lov', 8, '@', { allowSpace: true })).toEqual({
      start: 0,
      query: 'Ada Lov',
    })
  })

  it('honours a custom trigger', () => {
    expect(activeMention('bug #12', 7, '#')).toEqual({ start: 4, query: '12' })
  })

  it('clamps a caret past the end of the text', () => {
    expect(activeMention('@ad', 99)).toEqual({ start: 0, query: 'ad' })
  })
})

describe('applyMention', () => {
  it('rewrites the partial handle and nothing else', () => {
    expect(applyMention('ping @ad', { start: 5, query: 'ad' }, '@', 'ada')).toEqual({
      text: 'ping @ada ',
      caret: 10,
    })
  })

  it('works mid-sentence without doubling the space that was already there', () => {
    expect(applyMention('cc @jo about it', { start: 3, query: 'jo' }, '@', 'joana')).toEqual({
      text: 'cc @joana about it',
      caret: 9,
    })
  })

  it('adds the trailing gap itself when there is no text after', () => {
    expect(applyMention('ping @ad', { start: 5, query: 'ad' }, '@', 'ada')).toEqual({
      text: 'ping @ada ',
      caret: 10,
    })
  })

  it('replaces the whole query however long it was', () => {
    expect(applyMention('@abc', { start: 0, query: 'abc' }, '@', 'ada')).toEqual({
      text: '@ada ',
      caret: 5,
    })
  })
})

describe('matchMentions', () => {
  const options: (string | MentionOption)[] = [
    { key: 'ada', label: 'Ada Lovelace', description: 'Math' },
    { key: 'grace', label: 'Grace Hopper', disabled: true },
    'radia',
  ]

  it('promotes bare strings to options', () => {
    expect(matchMentions(options, 'radia')).toEqual([{ key: 'radia', label: 'radia' }])
  })

  it('matches the label or the key', () => {
    expect(matchMentions(options, 'lovel').map((o) => o.key)).toEqual(['ada'])
    expect(matchMentions(options, 'GRA').map((o) => o.key)).toEqual(['grace'])
  })

  it('shows everything for an empty query', () => {
    expect(matchMentions(options, '')).toHaveLength(3)
  })

  it('caps how many rows come back', () => {
    expect(matchMentions(options, '', 2)).toHaveLength(2)
  })

  it('keeps disabled rows visible so they can be shown greyed out', () => {
    expect(matchMentions(options, 'grace')[0].disabled).toBe(true)
  })
})

describe('nextActiveIndex', () => {
  const options: MentionOption[] = [
    { key: 'a', label: 'a' },
    { key: 'b', label: 'b', disabled: true },
    { key: 'c', label: 'c' },
  ]

  it('wraps around both ends', () => {
    expect(nextActiveIndex(options, -1, 1)).toBe(0)
    expect(nextActiveIndex(options, 2, 1)).toBe(0)
    expect(nextActiveIndex(options, 0, -1)).toBe(2)
  })

  it('steps over rows it cannot accept', () => {
    expect(nextActiveIndex(options, 0, 1)).toBe(2)
  })

  it('gives up when everything is disabled', () => {
    const blocked: MentionOption[] = [
      { key: 'a', label: 'a', disabled: true },
      { key: 'b', label: 'b', disabled: true },
    ]
    expect(nextActiveIndex(blocked, 0, 1)).toBe(-1)
  })
})
