import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { UpdateDocumentSchema } from '@/lib/content/schema'
import {
  deleteDocument,
  getDocument,
  updateDocument,
} from '@/lib/content/storage'
import {
  deleteDocumentFromGitHub,
  syncDocumentToGitHub,
} from '@/lib/github/sync'

// Cached helper for getting a document
async function getDocumentCached(slug: string) {
  'use cache'
  cacheLife('documents')
  cacheTag(`doc-${slug}`)

  return await getDocument(slug)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug: slugParts } = await params
    const slug = slugParts.join('/')

    const document = await getDocumentCached(slug)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error getting document:', error)
    return NextResponse.json(
      { error: 'Failed to get document' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug: slugParts } = await params
    const slug = slugParts.join('/')

    const body = await request.json()
    const validatedInput = UpdateDocumentSchema.safeParse(body)

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedInput.error.issues },
        { status: 400 },
      )
    }

    const document = await updateDocument(slug, validatedInput.data)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Sync to GitHub (auto-commit)
    const syncResult = await syncDocumentToGitHub(
      slug,
      document.metadata,
      document.content,
    )

    // Invalidate caches
    revalidateTag(`doc-${slug}`, 'max')
    revalidateTag('documents-list', 'max')

    return NextResponse.json({
      document: document.metadata,
      sync: syncResult,
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug: slugParts } = await params
    const slug = slugParts.join('/')

    // Get document first for GitHub sync
    const document = await getDocument(slug)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Soft delete locally
    const deleted = await deleteDocument(slug)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 },
      )
    }

    // Sync deletion to GitHub
    const syncResult = await deleteDocumentFromGitHub(
      slug,
      document.metadata.title,
    )

    // Invalidate caches
    revalidateTag(`doc-${slug}`, 'max')
    revalidateTag('documents-list', 'max')

    return NextResponse.json({
      success: true,
      sync: syncResult,
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 },
    )
  }
}
