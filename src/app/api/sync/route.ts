import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { getSyncStatus, pullFromGitHub } from '@/lib/github/sync'

export async function GET() {
  try {
    const status = await getSyncStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const result = await pullFromGitHub()

    if (result.success) {
      // Invalidate all document caches
      revalidateTag('documents-list', 'max')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error pulling from GitHub:', error)
    return NextResponse.json(
      { error: 'Failed to pull from GitHub' },
      { status: 500 },
    )
  }
}
