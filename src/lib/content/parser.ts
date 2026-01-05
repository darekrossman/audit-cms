import matter from 'gray-matter'
import {
  type Document,
  type DocumentMetadata,
  DocumentMetadataSchema,
} from './schema'

export function parseDocument(
  filePath: string,
  fileContent: string,
): Document | null {
  try {
    const { data, content } = matter(fileContent)

    const validatedMetadata = DocumentMetadataSchema.safeParse(data)

    if (!validatedMetadata.success) {
      console.error(
        `Invalid frontmatter in ${filePath}:`,
        validatedMetadata.error.issues,
      )
      return null
    }

    return {
      metadata: validatedMetadata.data,
      content: content.trim(),
      path: filePath,
    }
  } catch (error) {
    console.error(`Error parsing document ${filePath}:`, error)
    return null
  }
}

export function serializeDocument(
  metadata: DocumentMetadata,
  content: string,
): string {
  const frontmatter = matter.stringify(content, metadata)
  return frontmatter
}

export function validateMetadata(
  data: unknown,
):
  | { success: true; data: DocumentMetadata }
  | { success: false; errors: string[] } {
  const result = DocumentMetadataSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}

export function extractSlugFromPath(filePath: string): string {
  // Remove content/documents/ prefix and .mdx/.md extension
  return filePath
    .replace(/^content\/documents\//, '')
    .replace(/\.(mdx?|md)$/, '')
}

export function getPathFromSlug(slug: string): string {
  return `content/documents/${slug}.mdx`
}
