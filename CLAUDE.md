# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Start development server (uses Bun runtime)
bun run build      # Production build
bun run lint       # Check with Biome
bun run lint:fix   # Auto-fix lint issues
bun run format     # Format code with Biome
```

## Architecture

**Audit CMS** is a markdown content management system built with Next.js 16 and React 19. It provides document editing with automatic GitHub synchronization for backup and version control.

### Content System

- Documents stored as `.mdx` files in `/content/documents/` with YAML frontmatter
- Metadata schema defined in `/src/lib/content/schema.ts` (id, title, slug, status, tags, parent, order)
- MDX rendering via `next-mdx-remote-client` with Shiki syntax highlighting
- Custom MDX components in `/src/components/mdx/index.tsx` (callouts, anchor headings, smart links)

### GitHub Integration

- `/src/lib/github/client.ts` - Octokit wrapper singleton
- `/src/lib/github/sync.ts` - Push/pull operations with SHA caching
- Auto-commits on document create/update/delete
- Falls back gracefully if GitHub not configured
- Environment: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_CONTENT_PATH`

### API Routes (`/src/app/api/`)

| Route | Purpose |
|-------|---------|
| `/api/documents` | List/create documents |
| `/api/documents/[...slug]` | Get/update/delete single document |
| `/api/documents/tree` | Hierarchical document tree |
| `/api/sync` | GitHub sync status and pull |

### Page Structure

- `/docs` - Public documentation (server-rendered, published docs only)
- `/editor` - Document management dashboard (client-rendered)
- `/editor/new` - Create document form
- `/editor/[...slug]` - Document editor with auto-save (2s debounce)

### Caching

Uses Next.js Cache API with tags:
- `documents-list` - Invalidated on any document change
- `doc-{slug}` - Per-document cache

## Code Style

- **Biome** for linting/formatting: single quotes, no semicolons, organized imports
- **Path alias**: `@/*` maps to `./src/*`
- **UI components**: Base UI primitives (`@base-ui/react`) wrapped in `/src/components/ui/`
- **Styling**: Tailwind CSS v4 with `cn()` utility for class merging
- **Data attributes**: Components use `data-slot` for identification and `data-open`/`data-closed`/`data-selected` for state styling
