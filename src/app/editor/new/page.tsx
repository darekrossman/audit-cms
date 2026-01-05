import { Suspense } from 'react'
import { NewDocumentClient } from './client'

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <NewDocumentClient />
    </Suspense>
  )
}
