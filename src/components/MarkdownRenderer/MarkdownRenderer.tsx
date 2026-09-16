import * as React from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { CodeBlock } from '../CodeBlock'

export interface MarkdownRendererProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Markdown source. */
  children: string
}

/**
 * Markdown → this library's typography. Every element is mapped to library
 * tokens, so output stays consistent with the rest of the system and code
 * fences become `CodeBlock` (label + copy) instead of bare `<pre>`.
 *
 * Requires the bundled `react-markdown` / `remark-gfm` / `rehype-highlight`
 * dependencies that ship with this package.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-lg font-semibold tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-medium">{children}</h4>,
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="marker:text-muted-foreground">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border" />,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  // The fence is replaced by `CodeBlock`, which brings its own <pre>.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const language = /language-([\w+-]+)/.exec(className ?? '')?.[1]

    if (language || className?.includes('hljs')) {
      return <CodeBlock language={language}>{children}</CodeBlock>
    }

    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    )
  },
  a: ({ href, children }) => {
    const isExternal = Boolean(href && /^https?:\/\//.test(href))

    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        className="rounded-sm font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {children}
      </a>
    )
  },
  table: ({ children }) => (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 align-top">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img
      src={typeof src === 'string' ? src : undefined}
      alt={alt ?? ''}
      className="max-w-full rounded-md"
    />
  ),
}

const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-3 text-sm', className)}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
)
MarkdownRenderer.displayName = 'MarkdownRenderer'

export { MarkdownRenderer }
