import { promises as fs } from 'node:fs'
import path from 'node:path'
import { serializeDocument } from '../content/parser'
import type { DocumentMetadata } from '../content/schema'
import {
  createOrUpdateFileOnGitHub,
  deleteFileOnGitHub,
  getFileFromGitHub,
  getGitHubConfig,
  listFilesFromGitHub,
} from './client'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'documents')

interface SyncResult {
  success: boolean
  message: string
  sha?: string
}

// Track file SHAs for updates
const fileShaCache = new Map<string, string>()

export async function syncDocumentToGitHub(
  slug: string,
  metadata: DocumentMetadata,
  content: string,
): Promise<SyncResult> {
  const config = getGitHubConfig()

  if (!config.isConfigured) {
    return {
      success: true,
      message: 'GitHub sync not configured - skipping',
    }
  }

  const filePath = `${slug}.mdx`
  const fileContent = serializeDocument(metadata, content)

  try {
    // Get existing file SHA if it exists
    const existingFile = await getFileFromGitHub(filePath)
    const sha = existingFile?.sha ?? fileShaCache.get(slug)

    const result = await createOrUpdateFileOnGitHub(
      filePath,
      fileContent,
      `Update: ${metadata.title}`,
      sha,
    )

    if (result) {
      fileShaCache.set(slug, result.sha)
      return {
        success: true,
        message: 'Synced to GitHub',
        sha: result.sha,
      }
    }

    return {
      success: false,
      message: 'Failed to sync to GitHub',
    }
  } catch (error) {
    console.error('GitHub sync error:', error)
    return {
      success: false,
      message: `Sync error: ${(error as Error).message}`,
    }
  }
}

export async function deleteDocumentFromGitHub(
  slug: string,
  title: string,
): Promise<SyncResult> {
  const config = getGitHubConfig()

  if (!config.isConfigured) {
    return {
      success: true,
      message: 'GitHub sync not configured - skipping',
    }
  }

  const filePath = `${slug}.mdx`

  try {
    // Get file SHA for deletion
    const existingFile = await getFileFromGitHub(filePath)

    if (!existingFile) {
      return {
        success: true,
        message: 'File not found on GitHub',
      }
    }

    const deleted = await deleteFileOnGitHub(
      filePath,
      existingFile.sha,
      `Delete: ${title}`,
    )

    if (deleted) {
      fileShaCache.delete(slug)
      return {
        success: true,
        message: 'Deleted from GitHub',
      }
    }

    return {
      success: false,
      message: 'Failed to delete from GitHub',
    }
  } catch (error) {
    console.error('GitHub delete error:', error)
    return {
      success: false,
      message: `Delete error: ${(error as Error).message}`,
    }
  }
}

export async function pullFromGitHub(): Promise<{
  success: boolean
  imported: number
  errors: string[]
}> {
  const config = getGitHubConfig()
  const errors: string[] = []
  let imported = 0

  if (!config.isConfigured) {
    return {
      success: false,
      imported: 0,
      errors: ['GitHub sync not configured'],
    }
  }

  try {
    // Ensure local content directory exists
    await fs.mkdir(CONTENT_DIR, { recursive: true })

    // Recursively fetch all files
    async function fetchDir(dirPath = ''): Promise<void> {
      const files = await listFilesFromGitHub(dirPath)

      for (const file of files) {
        if (file.type === 'dir') {
          // Recurse into subdirectory
          const subPath = dirPath ? `${dirPath}/${file.name}` : file.name
          await fetchDir(subPath)
        } else if (file.name.endsWith('.mdx') || file.name.endsWith('.md')) {
          // Fetch file content
          const relativePath = dirPath ? `${dirPath}/${file.name}` : file.name
          const gitHubFile = await getFileFromGitHub(relativePath)

          if (gitHubFile) {
            // Write to local filesystem
            const localPath = path.join(CONTENT_DIR, relativePath)
            await fs.mkdir(path.dirname(localPath), { recursive: true })
            await fs.writeFile(localPath, gitHubFile.content, 'utf-8')

            // Cache SHA
            const slug = relativePath.replace(/\.(mdx?|md)$/, '')
            fileShaCache.set(slug, gitHubFile.sha)

            imported++
          }
        }
      }
    }

    await fetchDir()

    return {
      success: true,
      imported,
      errors,
    }
  } catch (error) {
    console.error('Pull from GitHub error:', error)
    return {
      success: false,
      imported,
      errors: [(error as Error).message],
    }
  }
}

export async function getSyncStatus(): Promise<{
  configured: boolean
  owner: string
  repo: string
  branch: string
  lastSync?: string
}> {
  const config = getGitHubConfig()

  return {
    configured: config.isConfigured,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  }
}
