import { cacheLife, cacheTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { getDocumentTree } from '@/lib/content/storage'

async function getDocumentTreeCached() {
  'use cache'
  cacheLife('frequent')
  cacheTag('documents-list')

  return await getDocumentTree()
}

export async function GET() {
  try {
    const tree = await getDocumentTreeCached()

    return NextResponse.json({ tree })
  } catch (error) {
    console.error('Error getting document tree:', error)
    return NextResponse.json(
      { error: 'Failed to get document tree' },
      { status: 500 },
    )
  }
}
