import { z } from 'zod'

export const DocumentMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-/]+$/,
      'Slug must be lowercase alphanumeric with hyphens and slashes',
    ),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
  parent: z.string().optional(),
  order: z.number().default(0),
})

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>

export interface Document {
  metadata: DocumentMetadata
  content: string
  path: string
}

export interface DocumentTreeNode {
  slug: string
  title: string
  children: DocumentTreeNode[]
  metadata: DocumentMetadata
}

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-/]+$/)
    .optional(),
  content: z.string().default(''),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
  parent: z.string().optional(),
  order: z.number().default(0),
})

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
  parent: z.string().nullable().optional(),
  order: z.number().optional(),
})

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
