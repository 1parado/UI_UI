import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const descriptionsVariants = cva('grid', {
  variants: {
    orientation: {
      /** Label above the value — reads like a form field. */
      vertical: 'gap-x-6 gap-y-4',
      /** Label to the left of the value — reads like a spec sheet. */
      horizontal: 'gap-x-6 gap-y-2',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

type DescriptionsOrientation = NonNullable<
  VariantProps<typeof descriptionsVariants>['orientation']
>

const DescriptionsContext = React.createContext<DescriptionsOrientation>('vertical')

export interface DescriptionsProps
  extends React.HTMLAttributes<HTMLDListElement>,
    VariantProps<typeof descriptionsVariants> {
  /** Label/value pairs per row. Wraps to a new row past this count. */
  columns?: number
}

/**
 * Definition list for a detail panel — the "properties" column of a settings,
 * profile or resource page.
 *
 * ```tsx
 * <Descriptions columns={2} orientation="horizontal">
 *   <DescriptionsItem label="Status">Running</DescriptionsItem>
 *   <DescriptionsItem label="Region">ap-guangzhou</DescriptionsItem>
 *   <DescriptionsItem label="Endpoint" span>
 *     https://api.example.com/v1
 *   </DescriptionsItem>
 * </Descriptions>
 * ```
 */
const Descriptions = React.forwardRef<HTMLDListElement, DescriptionsProps>(
  ({ className, columns = 1, orientation, children, ...props }, ref) => (
    <dl
      ref={ref}
      data-slot="descriptions"
      data-orientation={orientation ?? 'vertical'}
      // The column count is geometry, not colour, so it drives a CSS variable
      // rather than a class — `columns` can then be any number at runtime.
      style={{ '--descriptions-columns': columns } as React.CSSProperties}
      className={cn(
        descriptionsVariants({ orientation }),
        'grid-cols-[repeat(var(--descriptions-columns),minmax(0,1fr))]',
        className
      )}
      {...props}
    >
      <DescriptionsContext.Provider value={orientation ?? 'vertical'}>
        {children}
      </DescriptionsContext.Provider>
    </dl>
  )
)
Descriptions.displayName = 'Descriptions'

export interface DescriptionsItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  label: React.ReactNode
  /** Let this entry run the full width of the grid. */
  span?: boolean
}

const DescriptionsItem = React.forwardRef<HTMLDivElement, DescriptionsItemProps>(
  ({ className, label, span = false, children, ...props }, ref) => {
    const orientation = React.useContext(DescriptionsContext)
    const horizontal = orientation === 'horizontal'

    return (
      <div
        ref={ref}
        data-slot="descriptions-item"
        className={cn(
          'flex min-w-0',
          horizontal ? 'flex-row items-baseline gap-3' : 'flex-col gap-0.5',
          span && 'col-span-full',
          className
        )}
        {...props}
      >
        <dt
          className={cn(
            'text-sm text-muted-foreground',
            horizontal ? 'w-24 shrink-0' : undefined
          )}
        >
          {label}
        </dt>
        <dd className="min-w-0 text-sm text-foreground">{children}</dd>
      </div>
    )
  }
)
DescriptionsItem.displayName = 'DescriptionsItem'

export { Descriptions, DescriptionsItem }
