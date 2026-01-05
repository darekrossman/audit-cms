import { Octokit } from '@octokit/rest'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? 'main'
const GITHUB_CONTENT_PATH = process.env.GITHUB_CONTENT_PATH ?? 'documents'

let octokitInstance: Octokit | null = null

export function getOctokit(): Octokit | null {
  if (!GITHUB_TOKEN) {
    return null
  }

  if (!octokitInstance) {
    octokitInstance = new Octokit({ auth: GITHUB_TOKEN })
  }

  return octokitInstance
}

export function getGitHubConfig() {
  return {
    owner: GITHUB_OWNER ?? '',
    repo: GITHUB_REPO ?? '',
    branch: GITHUB_BRANCH,
    contentPath: GITHUB_CONTENT_PATH,
    isConfigured: Boolean(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO),
  }
}

export interface GitHubFile {
  path: string
  sha: string
  content: string
  encoding: string
}

export async function getFileFromGitHub(
  path: string,
): Promise<GitHubFile | null> {
  const octokit = getOctokit()
  const config = getGitHubConfig()

  if (!octokit || !config.isConfigured) {
    return null
  }

  try {
    const { data } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `${config.contentPath}/${path}`,
      ref: config.branch,
    })

    if (Array.isArray(data) || data.type !== 'file') {
      return null
    }

    return {
      path: data.path,
      sha: data.sha,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      encoding: data.encoding,
    }
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null
    }
    throw error
  }
}

export async function createOrUpdateFileOnGitHub(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ sha: string } | null> {
  const octokit = getOctokit()
  const config = getGitHubConfig()

  if (!octokit || !config.isConfigured) {
    return null
  }

  const fullPath = `${config.contentPath}/${path}`

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path: fullPath,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  })

  return { sha: data.content?.sha ?? '' }
}

export async function deleteFileOnGitHub(
  path: string,
  sha: string,
  message: string,
): Promise<boolean> {
  const octokit = getOctokit()
  const config = getGitHubConfig()

  if (!octokit || !config.isConfigured) {
    return false
  }

  const fullPath = `${config.contentPath}/${path}`

  await octokit.repos.deleteFile({
    owner: config.owner,
    repo: config.repo,
    path: fullPath,
    message,
    sha,
    branch: config.branch,
  })

  return true
}

export async function listFilesFromGitHub(
  path = '',
): Promise<{ name: string; path: string; type: string; sha: string }[]> {
  const octokit = getOctokit()
  const config = getGitHubConfig()

  if (!octokit || !config.isConfigured) {
    return []
  }

  try {
    const fullPath = path ? `${config.contentPath}/${path}` : config.contentPath

    const { data } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: fullPath,
      ref: config.branch,
    })

    if (!Array.isArray(data)) {
      return []
    }

    return data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      sha: item.sha,
    }))
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return []
    }
    throw error
  }
}
