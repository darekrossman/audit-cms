import { NextResponse } from 'next/server'
import { getGitHubConfig, getOctokit } from '@/lib/github/client'

export async function GET() {
  try {
    const config = getGitHubConfig()
    const octokit = getOctokit()

    if (!config.isConfigured || !octokit) {
      return NextResponse.json({
        configured: false,
        message: 'GitHub sync not configured',
      })
    }

    // Test connection by fetching repo info
    const { data: repo } = await octokit.repos.get({
      owner: config.owner,
      repo: config.repo,
    })

    return NextResponse.json({
      configured: true,
      connected: true,
      repository: {
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        private: repo.private,
      },
      config: {
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        contentPath: config.contentPath,
      },
    })
  } catch (error) {
    console.error('Error checking GitHub connection:', error)
    return NextResponse.json({
      configured: true,
      connected: false,
      error: (error as Error).message,
    })
  }
}
