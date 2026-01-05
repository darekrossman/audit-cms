'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { DocumentMetadata } from '@/lib/content/schema'

interface DocumentListItem extends DocumentMetadata {
  contentPreview: string
}

export function EditorIndexClient() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<{
    configured: boolean
    connected?: boolean
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [docsRes, syncRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/sync'),
        ])

        if (docsRes.ok) {
          const data = await docsRes.json()
          setDocuments(data.documents)
        }

        if (syncRes.ok) {
          const data = await syncRes.json()
          setSyncStatus(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleSync() {
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className="text-muted-foreground">
            Manage your documentation content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/editor/new">
            <Button>New Document</Button>
          </Link>
          {syncStatus?.configured && (
            <Button variant="outline" size="sm" onClick={handleSync}>
              Pull from GitHub
            </Button>
          )}
          {syncStatus && (
            <Badge variant={syncStatus.configured ? 'default' : 'secondary'}>
              {syncStatus.configured ? 'GitHub Connected' : 'Local Only'}
            </Badge>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No documents yet</CardTitle>
            <CardDescription>
              Create your first document to get started.
            </CardDescription>
            <Link href="/editor/new" className="mt-4">
              <Button>Create Document</Button>
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/editor/${doc.slug}`} className="block">
              <Card className="hover:border-primary transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      {doc.description && (
                        <CardDescription>{doc.description}</CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={
                        doc.status === 'published'
                          ? 'default'
                          : doc.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {doc.slug}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
