import { Suspense } from 'react'
import { EditorIndexClient } from './client'

export default function EditorIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <EditorIndexClient />
    </Suspense>
  )
}
