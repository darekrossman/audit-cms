import rehypeShiki from '@shikijs/rehype'
import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc'
import remarkGfm from 'remark-gfm'
import { remarkMermaid } from './remark-mermaid'

export const mdxOptions: MDXRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkMermaid, remarkGfm],
    rehypePlugins: [
      [
        rehypeShiki,
        {
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          },
        },
      ],
    ],
  },
}
