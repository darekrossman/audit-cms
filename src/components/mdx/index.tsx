import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const
  const sizes = {
    1: 'text-4xl font-bold mt-8 mb-4',
    2: 'text-3xl font-semibold mt-6 mb-3',
    3: 'text-2xl font-semibold mt-5 mb-2',
    4: 'text-xl font-medium mt-4 mb-2',
    5: 'text-lg font-medium mt-3 mb-1',
    6: 'text-base font-medium mt-2 mb-1',
  }

  return function Heading({ children }: { children: React.ReactNode }) {
    const text = typeof children === 'string' ? children : ''
    const id = slugify(text)

    return (
      <Tag id={id} className={cn('group scroll-mt-20', sizes[level])}>
        <a
          href={`#${id}`}
          className="no-underline hover:underline"
          aria-label={`Link to ${text}`}
        >
          {children}
          <span className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity">
            #
          </span>
        </a>
      </Tag>
    )
  }
}

function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'error' | 'success'
  children: React.ReactNode
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  }

  return (
    <div className={cn('border-l-4 p-4 my-4 rounded-r', styles[type])}>
      {children}
    </div>
  )
}

function DocumentLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  // Check if it's an internal document link (starts with / or is relative)
  const isInternal = href.startsWith('/') || !href.includes('://')

  if (isInternal) {
    const docHref = href.startsWith('/docs') ? href : `/docs/${href}`
    return (
      <Link href={docHref} className="text-primary hover:underline">
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {children}
      <span className="ml-1 text-xs">↗</span>
    </a>
  )
}

export const mdxComponents: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: DocumentLink,
  p: ({ children }) => <p className="my-4 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="my-4 ml-6 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 ml-6 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="my-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-4 p-4 rounded-lg overflow-x-auto bg-muted text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2">{children}</td>
  ),
  img: ({ src, alt }) => {
    if (!src) return null
    const isExternal = src.startsWith('http://') || src.startsWith('https://')
    return (
      <figure className="my-4">
        <div className="relative w-full aspect-video">
          <Image
            src={src}
            alt={alt ?? ''}
            fill
            className="rounded-lg object-contain"
            unoptimized={isExternal}
          />
        </div>
        {alt && (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {alt}
          </figcaption>
        )}
      </figure>
    )
  },
  Callout,
}
