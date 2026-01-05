import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { listDocuments } from '@/lib/content/storage'

async function getDocuments() {
  'use cache'
  cacheLife('days')
  cacheTag('documents-list')

  const docs = await listDocuments()
  return docs.filter((doc) => doc.metadata.status === 'published')
}

export default async function DocsIndexPage() {
  const documents = await getDocuments()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground">Browse all available documents</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No documents yet</CardTitle>
            <CardDescription>
              Create your first document using the editor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link
              key={doc.metadata.id}
              href={`/docs/${doc.metadata.slug}`}
              className="block"
            >
              <Card className="h-full hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {doc.metadata.title}
                  </CardTitle>
                  {doc.metadata.description && (
                    <CardDescription>
                      {doc.metadata.description}
                    </CardDescription>
                  )}
                  {doc.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.metadata.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
