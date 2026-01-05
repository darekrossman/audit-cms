'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { Document } from '@/lib/content/schema'

interface EditorClientProps {
  slug: string
}

export function EditorClient({ slug }: EditorClientProps) {
  const router = useRouter()

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    'draft',
  )
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${slug}`)
        if (!response.ok) {
          throw new Error('Document not found')
        }
        const data = await response.json()
        setDocument(data.document)

        // Initialize form state
        setTitle(data.document.metadata.title)
        setDescription(data.document.metadata.description || '')
        setStatus(data.document.metadata.status)
        setTags(data.document.metadata.tags.join(', '))
        setContent(data.document.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [slug])

  const handleSave = useCallback(async () => {
    if (!document) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/documents/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          status,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          content,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setLastSaved(new Date())
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [document, slug, title, description, status, tags, content])

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!hasChanges || !document) return

    const timer = setTimeout(() => {
      handleSave()
    }, 2000)

    return () => clearTimeout(timer)
  }, [hasChanges, document, handleSave])

  // Track changes
  useEffect(() => {
    if (!document) return
    const changed =
      title !== document.metadata.title ||
      description !== (document.metadata.description || '') ||
      status !== document.metadata.status ||
      tags !== document.metadata.tags.join(', ') ||
      content !== document.content

    setHasChanges(changed)
  }, [document, title, description, status, tags, content])

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      router.push('/editor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">Loading document...</div>
      </div>
    )
  }

  if (error && !document) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-destructive">{error}</div>
        <Button className="mt-4" onClick={() => router.push('/editor')}>
          Back to Editor
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/editor')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{title || 'Untitled'}</h1>
            <p className="text-sm text-muted-foreground">{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {hasChanges && <Badge variant="secondary">Unsaved changes</Badge>}
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/docs/${slug}`, '_blank')}
          >
            Preview
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="border rounded-lg">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              className="min-h-[500px] font-mono text-sm border-0 resize-none focus-visible:ring-0"
            />
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as 'draft' | 'published' | 'archived')
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Created:</strong>{' '}
              {document?.metadata.createdAt
                ? new Date(document.metadata.createdAt).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>Updated:</strong>{' '}
              {document?.metadata.updatedAt
                ? new Date(document.metadata.updatedAt).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>ID:</strong> {document?.metadata.id}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
