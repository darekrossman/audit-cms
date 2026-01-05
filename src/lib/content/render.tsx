import { cacheLife, cacheTag } from 'next/cache'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import { mdxComponents } from '@/components/mdx'
import { mdxOptions } from '@/lib/mdx/config'
import type { Document } from './schema'
import { getDocument } from './storage'

interface RenderResult {
  metadata: Document['metadata']
  Content: React.ReactNode
}

export async function renderDocument(
  slug: string,
): Promise<RenderResult | null> {
  'use cache'
  cacheLife('days')
  cacheTag(`doc-${slug}`)

  const doc = await getDocument(slug)

  if (!doc) {
    return null
  }

  const Content = (
    <MDXRemote
      source={doc.content}
      options={mdxOptions}
      components={mdxComponents}
    />
  )

  return {
    metadata: doc.metadata,
    Content,
  }
}

// Server action to invalidate document cache
export async function invalidateDocumentCache(slug: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  revalidateTag(`doc-${slug}`, 'max')
}
