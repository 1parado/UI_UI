import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { StarIcon } from '@/lib/icons'
import { useControllableNumber } from '@/lib/use-controllable-state'

const ratingStarVariants = cva('', {
  variants: {
    size: {
      sm: 'size-3.5',
      default: 'size-5',
      lg: 'size-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof ratingStarVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** How many stars to draw. */
  max?: number
  /** Smallest increment. Pass `0.5` to allow half stars. */
  step?: number
  readOnly?: boolean
  disabled?: boolean
}

/**
 * Star rating.
 *
 * The whole group is one focusable slider rather than five tab stops, which is
 * how the ARIA APG models a range and also what makes half stars expressible —
 * the value is a number, not "which star is checked". Arrow keys move by `step`,
 * Home and End jump to the ends, and the stars themselves are plain click
 * targets.
 *
 * ```tsx
 * <Rating defaultValue={3} onValueChange={setScore} />
 * <Rating value={4.5} step={0.5} readOnly />
 * ```
 */
const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      max = 5,
      step = 1,
      size,
      readOnly = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [current, setValue] = useControllableNumber({ value, defaultValue, onValueChange })
    const [hovered, setHovered] = React.useState<number | null>(null)

    const interactive = !readOnly && !disabled
    const stars = Math.max(1, Math.floor(max))
    const shown = hovered ?? current

    /** Clamp to the range and land on a multiple of `step`. */
    const snap = React.useCallback(
      (next: number) => {
        const stepped = Math.round(next / step) * step
        // Rounding away binary error keeps 0.5 steps at 0.5, not 0.5000000001.
        return Math.min(stars, Math.max(0, Number(stepped.toFixed(4))))
      },
      [step, stars]
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return

      const targets: Record<string, number> = {
        ArrowRight: current + step,
        ArrowUp: current + step,
        ArrowLeft: current - step,
        ArrowDown: current - step,
        Home: 0,
        End: stars,
      }

      const target = targets[event.key]
      if (target === undefined) return

      event.preventDefault()
      setValue(snap(target))
    }

    return (
      <div
        ref={ref}
        role="slider"
        tabIndex={interactive ? 0 : -1}
        aria-valuemin={0}
        aria-valuemax={stars}
        aria-valuenow={current}
        aria-valuetext={`${current} of ${stars}`}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        data-slot="rating"
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHovered(null)}
        {...props}
      >
        {Array.from({ length: stars }, (_, index) => {
          const fill = Math.min(1, Math.max(0, shown - index))

          return (
            <button
              key={index}
              type="button"
              tabIndex={-1}
              disabled={!interactive}
              aria-label={`Set rating to ${index + 1}`}
              className="relative block shrink-0"
              onMouseEnter={() => {
                if (interactive) setHovered(index + 1)
              }}
              onFocus={() => {
                if (interactive) setHovered(index + 1)
              }}
              onClick={() => {
                if (interactive) setValue(snap(index + 1))
              }}
            >
              <StarIcon
                className={cn(ratingStarVariants({ size }), 'text-muted-foreground/35')}
              />
              {fill > 0 && (
                // Clipping a filled star is how a half lands between two whole
                // ones without a second icon set.
                <span
                  className="absolute left-0 top-0 h-full overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarIcon
                    className={cn(ratingStarVariants({ size }), 'text-warning')}
                    fill="currentColor"
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }
)
Rating.displayName = 'Rating'

export { Rating }
