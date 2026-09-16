import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

const PageList = ({ page, pageCount }: { page: number; pageCount: number }) => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href="#" text="" />
      </PaginationItem>
      {getPaginationRange({ page, pageCount }).map((item, index) => (
        <PaginationItem key={`${item}-${index}`}>
          {item === 'ellipsis' ? (
            <PaginationEllipsis />
          ) : (
            <PaginationLink href="#" isActive={item === page}>
              {item}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext href="#" text="" />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
)

/**
 * `getPaginationRange` collapses the middle once the bar would get too wide.
 * It is a pure function, so the link markup stays entirely up to you.
 */
export const CollapsedRanges: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {[
        { page: 1, pageCount: 20 },
        { page: 2, pageCount: 20 },
        { page: 10, pageCount: 20 },
        { page: 19, pageCount: 20 },
        { page: 20, pageCount: 20 },
      ].map(({ page, pageCount }) => (
        <PageList key={page} page={page} pageCount={pageCount} />
      ))}
    </div>
  ),
}

const InteractiveExample = () => {
  const pageCount = 24
  const [page, setPage] = React.useState(9)

  const go = (next: number) => {
    if (next < 1 || next > pageCount) return
    setPage(next)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              onClick={(event) => {
                event.preventDefault()
                go(page - 1)
              }}
            />
          </PaginationItem>
          {getPaginationRange({ page, pageCount }).map((item, index) => (
            <PaginationItem key={`${item}-${index}`}>
              {item === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={(event) => {
                    event.preventDefault()
                    go(item)
                  }}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page === pageCount}
              className={
                page === pageCount ? 'pointer-events-none opacity-50' : ''
              }
              onClick={(event) => {
                event.preventDefault()
                go(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>
    </div>
  )
}

export const Interactive: Story = { render: () => <InteractiveExample /> }
