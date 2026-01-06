'use client'

import { useEffect, useId, useState } from 'react'

interface MermaidProps {
  chart: string
}

// Preload mermaid module
let mermaidPromise: Promise<typeof import('mermaid')> | null = null
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid')
  }
  return mermaidPromise
}

export function Mermaid({ chart }: MermaidProps) {
  return null
  // const id = useId()
  // const [svg, setSvg] = useState<string>('')
  // const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   let cancelled = false

  //   const renderChart = async () => {
  //     try {
  //       const mermaid = (await getMermaid()).default

  //       mermaid.initialize({
  //         startOnLoad: false,
  //         theme: 'neutral',
  //         securityLevel: 'loose',
  //         fontFamily: 'inherit',
  //       })

  //       const mermaidId = `mermaid-${id.replace(/:/g, '')}`
  //       const { svg } = await mermaid.render(mermaidId, chart)

  //       if (!cancelled) {
  //         setSvg(svg)
  //         setError(null)
  //       }
  //     } catch (err) {
  //       if (!cancelled) {
  //         console.error('Mermaid render error:', err)
  //         setError(
  //           err instanceof Error ? err.message : 'Failed to render diagram',
  //         )
  //       }
  //     }
  //   }

  //   renderChart()

  //   return () => {
  //     cancelled = true
  //   }
  // }, [chart, id])

  // if (error) {
  //   return (
  //     <div className="my-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
  //       <p className="text-sm text-red-800 dark:text-red-200 font-medium">
  //         Mermaid Error
  //       </p>
  //       <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-x-auto">
  //         {error}
  //       </pre>
  //       <details className="mt-2">
  //         <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
  //           Show source
  //         </summary>
  //         <pre className="mt-1 text-xs text-red-700 dark:text-red-300 overflow-x-auto">
  //           {chart}
  //         </pre>
  //       </details>
  //     </div>
  //   )
  // }

  // if (!svg) {
  //   return (
  //     <div className="my-4 p-4 rounded-lg bg-muted flex items-center justify-center min-h-[100px]">
  //       <span className="text-sm text-muted-foreground">
  //         Loading diagram...
  //       </span>
  //     </div>
  //   )
  // }

  // return (
  //   <div
  //     className="my-4 p-4 rounded-lg bg-muted overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
  //     dangerouslySetInnerHTML={{ __html: svg }}
  //   />
  // )
}
