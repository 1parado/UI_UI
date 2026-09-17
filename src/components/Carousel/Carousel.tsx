import * as React from 'react'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/icons'

export type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1]

export interface CarouselLabels {
  previous?: string
  next?: string
  slide?: string
}

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi
  orientation: 'horizontal' | 'vertical'
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  labels: Required<CarouselLabels>
}

const defaultLabels: Required<CarouselLabels> = {
  previous: 'Previous slide',
  next: 'Next slide',
  slide: 'slide',
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error('useCarousel must be used within a <Carousel>')
  return context
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  /** Escape hatch for imperative control — `api.scrollTo(3)`, autoplay, etc. */
  setApi?: (api: CarouselApi) => void
  labels?: CarouselLabels
}

/**
 * A scroll-snap carousel with arrow keys and buttons.
 *
 * `embla-carousel` does the scrolling — it uses native overflow so touch,
 * trackpad and momentum all behave the way the platform does, instead of
 * re-implementing drag physics. What this adds is the ARIA wiring
 * (`carousel`/`slide` roles, the "3 of 7" position), keyboard handling, and
 * disabled arrows that reflect whether there is anywhere left to go.
 *
 * Give it an `aria-label` — a `region` with a roledescription and no name is
 * announced as an unnamed region, which is worse than nothing.
 *
 * ```tsx
 * <Carousel aria-label="Featured projects" opts={{ loop: true }}>
 *   <CarouselContent>
 *     <CarouselItem>…</CarouselItem>
 *   </CarouselContent>
 *   <CarouselPrevious />
 *   <CarouselNext />
 * </Carousel>
 * ```
 */
const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      children,
      opts,
      plugins,
      orientation = 'horizontal',
      setApi,
      labels,
      ...props
    },
    ref
  ) => {
    const text = { ...defaultLabels, ...labels }
    const [carouselRef, api] = useEmblaCarousel(
      { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((instance: CarouselApi) => {
      if (!instance) return
      setCanScrollPrev(instance.canScrollPrev())
      setCanScrollNext(instance.canScrollNext())
    }, [])

    React.useEffect(() => {
      if (!api) return

      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)

      return () => {
        api.off('select', onSelect)
        api.off('reInit', onSelect)
      }
    }, [api, onSelect])

    React.useEffect(() => {
      if (api && setApi) setApi(api)
    }, [api, setApi])

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollNext()
      }
    }

    const value = React.useMemo<CarouselContextValue>(
      () => ({
        carouselRef,
        api,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        labels: text,
      }),
      // `text` is rebuilt each render; the pieces it is built from are stable.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [carouselRef, api, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext, labels]
    )

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = 'Carousel'

export type CarouselContentProps = React.HTMLAttributes<HTMLDivElement>

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel()

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn('flex', orientation === 'vertical' && 'flex-col', className)}
          {...props}
        />
      </div>
    )
  }
)
CarouselContent.displayName = 'CarouselContent'

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel()

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          'min-w-0 shrink-0 grow-0 basis-full',
          orientation === 'vertical' && 'basis-full',
          className
        )}
        {...props}
      />
    )
  }
)
CarouselItem.displayName = 'CarouselItem'

const arrowClassName =
  'absolute inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40'

export type CarouselArrowProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselArrowProps>(
  ({ className, ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev, labels } = useCarousel()

    return (
      <button
        ref={ref}
        type="button"
        aria-label={labels.previous}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          arrowClassName,
          orientation === 'horizontal'
            ? 'left-2 top-1/2 -translate-y-1/2'
            : 'left-1/2 top-2 -translate-x-1/2 rotate-90',
          className
        )}
        {...props}
      >
        <ChevronLeftIcon aria-hidden className="size-4" />
      </button>
    )
  }
)
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselArrowProps>(
  ({ className, ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext, labels } = useCarousel()

    return (
      <button
        ref={ref}
        type="button"
        aria-label={labels.next}
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          arrowClassName,
          orientation === 'horizontal'
            ? 'right-2 top-1/2 -translate-y-1/2'
            : 'bottom-2 left-1/2 -translate-x-1/2 rotate-90',
          className
        )}
        {...props}
      >
        <ChevronRightIcon aria-hidden className="size-4" />
      </button>
    )
  }
)
CarouselNext.displayName = 'CarouselNext'

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel }
