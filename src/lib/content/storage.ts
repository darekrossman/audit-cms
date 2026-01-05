import { promises as fs } from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { parseDocument, serializeDocument } from './parser'
import {
  type CreateDocumentInput,
  type Document,
  type DocumentMetadata,
  type DocumentTreeNode,
  generateSlug,
  type UpdateDocumentInput,
} from './schema'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'documents')
const TRASH_DIR = path.join(process.cwd(), 'content', '.trash')

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // Directory may already exist
  }
}

function getFilePath(slug: string): string {
  return path.join(CONTENT_DIR, `${slug}.mdx`)
}

export async function listDocuments(parentSlug?: string): Promise<Document[]> {
  await ensureDir(CONTENT_DIR)

  const documents: Document[] = []

  async function walkDir(dir: string, prefix = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await walkDir(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name)
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8')
        const slug = prefix
          ? `${prefix}/${entry.name.replace(/\.(mdx?|md)$/, '')}`
          : entry.name.replace(/\.(mdx?|md)$/, '')

        const doc = parseDocument(fullPath, content)
        if (doc) {
          // Override slug with computed one from path
          doc.metadata.slug = slug
          documents.push(doc)
        }
      }
    }
  }

  await walkDir(CONTENT_DIR)

  // Filter by parent if specified
  if (parentSlug !== undefined) {
    return documents.filter((doc) => doc.metadata.parent === parentSlug)
  }

  return documents.sort((a, b) => a.metadata.order - b.metadata.order)
}

export async function getDocument(slug: string): Promise<Document | null> {
  const filePath = getFilePath(slug)

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const doc = parseDocument(filePath, content)
    if (doc) {
      doc.metadata.slug = slug
    }
    return doc
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }
}

export async function createDocument(
  input: CreateDocumentInput,
): Promise<Document> {
  await ensureDir(CONTENT_DIR)

  const slug = input.slug ?? generateSlug(input.title)
  const filePath = getFilePath(slug)

  // Ensure parent directory exists for nested slugs
  const dirPath = path.dirname(filePath)
  await ensureDir(dirPath)

  // Check if document already exists
  try {
    await fs.access(filePath)
    throw new Error(`Document with slug "${slug}" already exists`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }

  const now = new Date().toISOString()
  const metadata: DocumentMetadata = {
    id: uuidv4(),
    title: input.title,
    slug,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    status: input.status,
    tags: input.tags,
    parent: input.parent,
    order: input.order,
  }

  const fileContent = serializeDocument(metadata, input.content)

  // Atomic write using temp file
  const tempPath = `${filePath}.tmp`
  await fs.writeFile(tempPath, fileContent, 'utf-8')
  await fs.rename(tempPath, filePath)

  return {
    metadata,
    content: input.content,
    path: filePath,
  }
}

export async function updateDocument(
  slug: string,
  input: UpdateDocumentInput,
): Promise<Document | null> {
  const existing = await getDocument(slug)
  if (!existing) {
    return null
  }

  const updatedMetadata: DocumentMetadata = {
    ...existing.metadata,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.parent !== undefined && { parent: input.parent ?? undefined }),
    ...(input.order !== undefined && { order: input.order }),
    updatedAt: new Date().toISOString(),
  }

  const updatedContent = input.content ?? existing.content

  const filePath = getFilePath(slug)
  const fileContent = serializeDocument(updatedMetadata, updatedContent)

  // Atomic write
  const tempPath = `${filePath}.tmp`
  await fs.writeFile(tempPath, fileContent, 'utf-8')
  await fs.rename(tempPath, filePath)

  return {
    metadata: updatedMetadata,
    content: updatedContent,
    path: filePath,
  }
}

export async function deleteDocument(slug: string): Promise<boolean> {
  const filePath = getFilePath(slug)

  try {
    await fs.access(filePath)
  } catch {
    return false
  }

  // Soft delete - move to trash
  await ensureDir(TRASH_DIR)
  const timestamp = Date.now()
  const trashPath = path.join(
    TRASH_DIR,
    `${timestamp}-${slug.replace(/\//g, '_')}.mdx`,
  )

  // Ensure trash subdirectory exists
  await ensureDir(path.dirname(trashPath))

  await fs.rename(filePath, trashPath)

  // Clean up empty parent directories
  const parentDir = path.dirname(filePath)
  try {
    const entries = await fs.readdir(parentDir)
    if (entries.length === 0 && parentDir !== CONTENT_DIR) {
      await fs.rmdir(parentDir)
    }
  } catch {
    // Ignore errors cleaning up directories
  }

  return true
}

export async function restoreDocument(
  trashFileName: string,
): Promise<Document | null> {
  const trashPath = path.join(TRASH_DIR, trashFileName)

  try {
    const content = await fs.readFile(trashPath, 'utf-8')
    const doc = parseDocument(trashPath, content)

    if (!doc) {
      return null
    }

    // Restore to original location
    const filePath = getFilePath(doc.metadata.slug)
    await ensureDir(path.dirname(filePath))
    await fs.rename(trashPath, filePath)

    return doc
  } catch {
    return null
  }
}

export async function getDocumentTree(): Promise<DocumentTreeNode[]> {
  const documents = await listDocuments()

  // Build a map for quick lookup
  const docMap = new Map<string, Document>()
  for (const doc of documents) {
    docMap.set(doc.metadata.slug, doc)
  }

  // Build tree structure
  const rootNodes: DocumentTreeNode[] = []
  const nodeMap = new Map<string, DocumentTreeNode>()

  // First pass: create all nodes
  for (const doc of documents) {
    const node: DocumentTreeNode = {
      slug: doc.metadata.slug,
      title: doc.metadata.title,
      children: [],
      metadata: doc.metadata,
    }
    nodeMap.set(doc.metadata.slug, node)
  }

  // Second pass: build tree
  for (const doc of documents) {
    const node = nodeMap.get(doc.metadata.slug)
    if (!node) continue

    if (doc.metadata.parent) {
      const parentNode = nodeMap.get(doc.metadata.parent)
      if (parentNode) {
        parentNode.children.push(node)
      } else {
        rootNodes.push(node)
      }
    } else {
      rootNodes.push(node)
    }
  }

  // Sort children by order
  function sortChildren(nodes: DocumentTreeNode[]): void {
    nodes.sort((a, b) => a.metadata.order - b.metadata.order)
    for (const node of nodes) {
      sortChildren(node.children)
    }
  }

  sortChildren(rootNodes)

  return rootNodes
}
