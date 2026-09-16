import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  getPaginationRange,
} from './Pagination'

describe('getPaginationRange', () => {
  it('lists every page when the count fits in the visible window', () => {
    expect(getPaginationRange({ page: 3, pageCount: 5 })).toEqual([
      1, 2, 3, 4, 5,
    ])
  })

  it('collapses both sides around a middle page', () => {
    expect(getPaginationRange({ page: 10, pageCount: 20 })).toEqual([
      1,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      20,
    ])
  })

  it('drops the left ellipsis near the start', () => {
    expect(getPaginationRange({ page: 2, pageCount: 20 })).toEqual([
      1,
      2,
      3,
      'ellipsis',
      20,
    ])
  })

  it('drops the right ellipsis near the end', () => {
    expect(getPaginationRange({ page: 19, pageCount: 20 })).toEqual([
      1,
      'ellipsis',
      18,
      19,
      20,
    ])
  })

  it('widens with siblingCount', () => {
    expect(
      getPaginationRange({ page: 10, pageCount: 20, siblingCount: 2 })
    ).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20])
  })

  it('never returns duplicates or out-of-range pages', () => {
    for (let page = 1; page <= 30; page += 1) {
      const range = getPaginationRange({ page, pageCount: 30 })
      const numbers = range.filter(
        (item): item is number => typeof item === 'number'
      )
      expect(new Set(numbers).size).toBe(numbers.length)
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b))
      expect(Math.min(...numbers)).toBe(1)
      expect(Math.max(...numbers)).toBe(30)
    }
  })

  it('clamps a page outside the range and ignores an empty page count', () => {
    const clampedHigh = getPaginationRange({ page: 99, pageCount: 20 })
    expect(clampedHigh[clampedHigh.length - 1]).toBe(20)
    expect(getPaginationRange({ page: -4, pageCount: 20 })[0]).toBe(1)
    expect(getPaginationRange({ page: 1, pageCount: 0 })).toEqual([])
  })
})

describe('Pagination', () => {
  it('exposes a navigation landmark and marks the active page', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )

    expect(
      screen.getByRole('navigation', { name: 'pagination' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute(
      'aria-current'
    )
  })
})
