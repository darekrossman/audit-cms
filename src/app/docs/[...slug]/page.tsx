import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { renderDocument } from '@/lib/content/render'
import { listDocuments } from '@/lib/content/storage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const documents = await listDocuments()
  const params = documents.map((doc) => ({
    slug: doc.metadata.slug.split('/'),
  }))
  // Next.js 16 requires at least one result when using Cache Components
  return params.length > 0 ? params : [{ slug: ['getting-started'] }]
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')

  const result = await renderDocument(slug)

  if (!result) {
    notFound()
  }

  const { metadata, Content } = result

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              ← Back to docs
            </Button>
          </Link>
          <Link href={`/editor/${slug}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">{metadata.title}</h1>

        {metadata.description && (
          <p className="text-xl text-muted-foreground mb-4">
            {metadata.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <span>
            Updated: {new Date(metadata.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {Content}
      </article>
    </div>
  )
}
