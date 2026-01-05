import { Suspense } from 'react'
import { EditorClient } from './client'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default function EditorPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">Loading document...</div>
        </div>
      }
    >
      {params.then(({ slug }) => (
        <EditorClient slug={slug.join('/')} />
      ))}
    </Suspense>
  )
}
