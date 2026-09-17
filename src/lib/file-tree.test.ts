import { describe, expect, it } from 'vitest'
import {
  buildFileTree,
  collectDirectoryIds,
  fileExtension,
  fileKind,
  splitPath,
} from './file-tree'

describe('splitPath', () => {
  it('splits on forward slashes', () => {
    expect(splitPath('src/lib/utils.ts')).toEqual(['src', 'lib', 'utils.ts'])
  })

  it('normalises backslashes', () => {
    expect(splitPath('src\\components\\Button.tsx')).toEqual(['src', 'components', 'Button.tsx'])
  })

  it('drops a leading ./ and empty segments', () => {
    expect(splitPath('./src//index.ts/')).toEqual(['src', 'index.ts'])
  })

  it('has nothing for an empty path', () => {
    expect(splitPath('')).toEqual([])
  })
})

describe('fileExtension', () => {
  it('reads the extension of the last segment', () => {
    expect(fileExtension('src/lib/utils.ts')).toBe('ts')
  })

  it('lowercases it', () => {
    expect(fileExtension('README.MD')).toBe('MD'.toLowerCase())
  })

  it('has none for a dotfile', () => {
    expect(fileExtension('.gitignore')).toBe('')
  })

  it('reads the last extension of a compound name', () => {
    expect(fileExtension('vite.config.ts')).toBe('ts')
    expect(fileExtension('.env.local')).toBe('local')
  })

  it('has none for a bare name', () => {
    expect(fileExtension('Makefile')).toBe('')
  })
})

describe('fileKind', () => {
  it('is a folder when told so, whatever the extension', () => {
    expect(fileKind('ts', true)).toBe('folder')
  })

  it('classifies source, data, images, documents and archives', () => {
    expect(fileKind('tsx')).toBe('code')
    expect(fileKind('json')).toBe('data')
    expect(fileKind('png')).toBe('image')
    expect(fileKind('md')).toBe('doc')
    expect(fileKind('gz')).toBe('archive')
  })

  it('falls back to a plain file', () => {
    expect(fileKind('')).toBe('file')
    expect(fileKind('xyz')).toBe('file')
  })
})

describe('buildFileTree', () => {
  it('nests a path one level at a time', () => {
    const tree = buildFileTree(['src/lib/utils.ts'])

    expect(tree).toHaveLength(1)
    expect(tree[0]).toMatchObject({ id: 'src', label: 'src', kind: 'folder' })
    expect(tree[0].children?.[0]).toMatchObject({ id: 'src/lib', kind: 'folder' })
    expect(tree[0].children?.[0].children?.[0]).toMatchObject({
      id: 'src/lib/utils.ts',
      label: 'utils.ts',
      extension: 'ts',
      kind: 'code',
    })
  })

  it('puts folders before files, both alphabetically', () => {
    const tree = buildFileTree([
      'src/index.ts',
      'README.md',
      'scripts/build.mjs',
      'components/Button.tsx',
    ])

    expect(tree.map((entry) => entry.label)).toEqual([
      'components',
      'scripts',
      'src',
      'README.md',
    ])
  })

  it('sorts a folder case-insensitively', () => {
    const tree = buildFileTree(['b/x.ts', 'A/y.ts', 'c/z.ts'])

    expect(tree.map((entry) => entry.label)).toEqual(['A', 'b', 'c'])
  })

  it('gives a folder its children and drops the duplicate', () => {
    const tree = buildFileTree(['src', 'src/index.ts'])

    expect(tree).toHaveLength(1)
    expect(tree[0].kind).toBe('folder')
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].extension).toBe('')
  })

  it('ignores a repeated path', () => {
    const tree = buildFileTree(['src/a.ts', 'src/a.ts'])

    expect(tree[0].children).toHaveLength(1)
  })

  it('strips a root prefix and keeps the ids relative to it', () => {
    const tree = buildFileTree(['app/src/main.ts', 'app/README.md'], { root: 'app' })

    expect(tree.map((entry) => entry.id)).toEqual(['src', 'README.md'])
    expect(tree[0].children?.[0].id).toBe('src/main.ts')
  })

  it('ignores empty entries', () => {
    expect(buildFileTree(['', '.', 'src/'])).toHaveLength(1)
  })

  it('has nothing for an empty list', () => {
    expect(buildFileTree([])).toEqual([])
  })

  it('collects every directory for a start-expanded default', () => {
    const tree = buildFileTree(['src/lib/utils.ts', 'src/index.ts', 'README.md'])

    expect(collectDirectoryIds(tree)).toEqual(['src', 'src/lib'])
  })
})
