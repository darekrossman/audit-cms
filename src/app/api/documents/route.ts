import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CreateDocumentSchema } from '@/lib/content/schema'
import { createDocument, listDocuments } from '@/lib/content/storage'
import { syncDocumentToGitHub } from '@/lib/github/sync'

// Cached helper for listing documents
async function getDocumentsList(parent?: string) {
  'use cache'
  cacheLife('days')
  cacheTag('documents-list')

  return await listDocuments(parent)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parent = searchParams.get('parent') ?? undefined

    const documents = await getDocumentsList(parent)

    return NextResponse.json({
      documents: documents.map((doc) => ({
        ...doc.metadata,
        contentPreview: doc.content.slice(0, 200),
      })),
    })
  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedInput = CreateDocumentSchema.safeParse(body)

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedInput.error.issues },
        { status: 400 },
      )
    }

    const document = await createDocument(validatedInput.data)

    // Sync to GitHub (auto-commit)
    const syncResult = await syncDocumentToGitHub(
      document.metadata.slug,
      document.metadata,
      document.content,
    )

    // Invalidate list cache
    revalidateTag('documents-list', 'max')

    return NextResponse.json(
      {
        document: document.metadata,
        sync: syncResult,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating document:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
