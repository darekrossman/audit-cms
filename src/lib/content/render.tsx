import { cacheLife } from 'next/cache'
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import { mdxComponents } from '@/components/mdx'
import { mdxOptions } from '../mdx/config'

export async function MDXContent({ source }: { source: string }) {
  'use cache'
  cacheLife('days')

  return (
    <MDXRemote
      source={source}
      options={mdxOptions}
      components={mdxComponents}
    />
  )
}
