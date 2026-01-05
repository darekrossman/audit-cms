import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Custom cache profiles for document management
    documents: {
      stale: 60, // 1 minute stale time
      revalidate: 300, // 5 minutes before revalidate
      expire: 3600, // 1 hour max
    },
    frequent: {
      stale: 10,
      revalidate: 60,
      expire: 300,
    },
  },
}

export default nextConfig
