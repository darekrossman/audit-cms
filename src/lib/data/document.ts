import { cacheLife, cacheTag } from 'next/cache'
import type { Document } from '@/lib/content/schema'
import { getDocument } from '@/lib/content/storage'

export interface DocumentData {
  metadata: Document['metadata']
  content: string
  formattedUpdatedAt: string
}

// Cache only the document data, not the rendered React elements
export async function getDocumentData(
  slug: string,
): Promise<DocumentData | null> {
  'use cache'
  cacheLife('days')
  cacheTag(`doc-${slug}`)

  const doc = await getDocument(slug)

  if (!doc) {
    return null
  }

  // Format date inside cached function to avoid hydration mismatch
  // Non-deterministic operations like new Date() must be inside 'use cache'
  const formattedUpdatedAt = new Date(
    doc.metadata.updatedAt,
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })

  return {
    metadata: doc.metadata,
    content: doc.content,
    formattedUpdatedAt,
  }
}

