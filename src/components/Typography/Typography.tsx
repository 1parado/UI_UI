import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const headingStyles = {
  1: 'text-4xl font-bold tracking-tight',
  2: 'text-3xl font-semibold tracking-tight',
  3: 'text-2xl font-semibold tracking-tight',
  4: 'text-xl font-semibold tracking-tight',
} as const

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading depth. Sets both the tag (`h1`–`h4`) and the type scale. */
  level?: keyof typeof headingStyles
}

/**
 * Section heading. Level is both semantics and size so one prop keeps the
 * outline and the visual hierarchy in sync.
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, className, ...props }, ref) => {
    const Comp = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
    return (
      <Comp
        ref={ref}
        className={cn('text-foreground', headingStyles[level], className)}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-base text-foreground',
      muted: 'text-base text-muted-foreground',
      lead: 'text-xl text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  /** Element to render. Defaults to `p`. */
  as?: 'p' | 'span' | 'div'
}

/** Body copy. `lead` opens a section, `muted` carries supporting detail. */
const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant, as: Comp = 'p', className, ...props }, ref) => (
    <Comp
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  )
)
Text.displayName = 'Text'

export type SmallProps = React.ComponentPropsWithoutRef<'small'>

/** Fine print — captions, footnotes, timestamps. */
const Small = React.forwardRef<HTMLElement, SmallProps>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn('text-sm font-medium leading-none text-muted-foreground', className)}
      {...props}
    />
  )
)
Small.displayName = 'Small'

export type BlockquoteProps = React.ComponentPropsWithoutRef<'blockquote'>

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn('border-l-2 pl-4 italic text-muted-foreground', className)}
      {...props}
    />
  )
)
Blockquote.displayName = 'Blockquote'

export type InlineCodeProps = React.ComponentPropsWithoutRef<'code'>

/** Code inside a sentence — for whole blocks use `CodeBlock`. */
const InlineCode = React.forwardRef<HTMLElement, InlineCodeProps>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
      {...props}
    />
  )
)
InlineCode.displayName = 'InlineCode'

export { Heading, Text, Small, Blockquote, InlineCode, textVariants }
