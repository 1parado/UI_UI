import { describe, expect, it } from 'vitest'
import { emptyCopy, emptyPresets, type EmptyPreset } from './empty'

const presets = Object.keys(emptyPresets) as EmptyPreset[]

describe('emptyPresets', () => {
  it('covers every preset with both lines of copy', () => {
    expect(presets.length).toBeGreaterThan(0)

    for (const preset of presets) {
      expect(emptyPresets[preset].title.length).toBeGreaterThan(0)
      expect(emptyPresets[preset].description.length).toBeGreaterThan(0)
    }
  })

  it('says something different each time', () => {
    const titles = presets.map((preset) => emptyPresets[preset].title)
    expect(new Set(titles).size).toBe(titles.length)
  })
})

describe('emptyCopy', () => {
  it('answers the preset copy untouched', () => {
    expect(emptyCopy('search')).toEqual(emptyPresets.search)
  })

  it('lets a caller replace one line and keep the other', () => {
    expect(emptyCopy('search', { title: 'No one by that name' })).toEqual({
      title: 'No one by that name',
      description: emptyPresets.search.description,
    })
  })

  it('does not write back into the preset table', () => {
    emptyCopy('inbox', { title: 'Mine now' })

    expect(emptyPresets.inbox.title).toBe('Nothing here yet')
  })
})
