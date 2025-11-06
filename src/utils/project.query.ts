/** Supported include flags for projects */
export type IncludeKey = 'categories' | 'links' | 'files'

/** Split CSV query parameters into string[] */
export const csv = (v?: string) =>
  v ? v.split(',').map(s => s.trim()).filter(Boolean) : []

/** Allowlist of safe sort fields */
export const SORT_WHITELIST = new Set([
  'created_at',
  'updated_at',
  'title',
  'like_count',
  'view_count'
] as const)

/** Normalize orderBy and order values */
export function safeOrder(orderBy?: string, order?: string) {
  const field = SORT_WHITELIST.has((orderBy ?? '') as any)
    ? (orderBy as string)
    : 'updated_at'
  const ascending = (order ?? 'desc').toLowerCase() === 'asc'
  return { field, ascending }
}

/** Build Supabase SELECT string based on requested includes */
export function buildSelect(includeList: IncludeKey[]) {
  const base = `
    project_id,
    title,
    content,
    badge,
    preview_image_url,
    short_description,
    status,
    like_count,
    view_count,
    created_at,
    updated_at
  `
  const include: string[] = []
  if (includeList.includes('categories')) {
    include.push(`
      project_categories:project_categories(
        category:categories(
          category_id,
          category_name
        )
      )
    `)
  }
  if (includeList.includes('links')) {
    include.push(`project_external_links(link_url)`)
  }
  if (includeList.includes('files')) {
    include.push(`project_files(file_id,file_url)`)
  }
  return [base, ...include].join(',')
}

/** Parameters accepted by listProjects() */
export type ListParams = {
  q?: string
  badge?: string
  statusList?: string[]
  from?: string
  to?: string
  contributors?: string[] // user_id[]
  orderBy?: string
  order?: 'asc' | 'desc'
  page: number
  pageSize: number
  include: IncludeKey[]
}

/** Calculate pagination range */
export function calcRange(page: number, pageSize: number) {
  const p = Math.max(1, page)
  const take = Math.min(100, Math.max(1, pageSize))
  const fromIdx = (p - 1) * take
  const toIdx = fromIdx + take - 1
  return { p, take, fromIdx, toIdx }
}

/** Map raw Supabase row to structured API response */
export function mapProjectRow(row: any) {
  return {
    projectId: row.project_id,
    title: row.title,
    badge: row.badge,
    status: row.status,
    previewImageUrl: row.preview_image_url ?? null,
    shortDescription: row.short_description ?? null,
    content: row.content ?? null,
    categories: (row.project_categories ?? [])
      .map((pc: any) => pc?.category)
      .filter(Boolean)
      .map((c: any) => ({
        categoryId: c.category_id,
        categoryName: c.category_name
      })),
    externalLinks: (row.project_external_links ?? []).map((l: any) => l.link_url),
    files: (row.project_files ?? []).map((f: any) => ({
      fileId: f.file_id,
      fileUrl: f.file_url
    })),
    likeCount: row.like_count ?? 0,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
