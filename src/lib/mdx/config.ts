import rehypeShiki from '@shikijs/rehype'
import type { MDXRemoteOptions } from 'next-mdx-remote-client/rsc'

export const mdxOptions: MDXRemoteOptions = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeShiki,
        {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        },
      ],
    ],
  },
}
