/** Supported include flags for projects */
export type IncludeKey = "categories" | "links" | "files" | "contributors" | "comments";

/** Split CSV query parameters into string[] */
export const csv = (v?: string) =>
  v
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

/** Allowlist of safe sort fields */
export const SORT_WHITELIST = new Set([
  "created_at",
  "updated_at",
  "title",
  "like_count",
  "view_count",
  "monthly_like_count",
  "monthly_view_count",
  "yearly_like_count",
  "yearly_view_count",
] as const);

/** Normalize orderBy and order values */
export function safeOrder(orderBy?: string, order?: string) {
  const field = SORT_WHITELIST.has((orderBy ?? "") as any)
    ? (orderBy as string)
    : "updated_at";
  const ascending = (order ?? "desc").toLowerCase() === "asc";
  return { field, ascending };
}

/** Check if orderBy needs stats data */
export function needsStatsData(orderBy?: string) {
  return orderBy?.includes("monthly_") || orderBy?.includes("yearly_");
}

/** Build Supabase SELECT string based on requested includes */
export function buildSelect(includeList: IncludeKey[], withStats = false) {
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
  `;
  const include: string[] = [];

  // Add stats subqueries if needed for ordering
  if (withStats) {
    include.push(`project_stats_monthly(month,views,likes)`);
  }

  if (includeList.includes("categories")) {
    include.push(`
      project_categories:project_categories(
        category:categories(
          category_id,
          category_name
        )
      )
    `);
  }
  if (includeList.includes("links")) {
    include.push(`project_external_links(link_url)`);
  }
  if (includeList.includes("files")) {
    include.push(`project_files(file_id,file_url)`);
  }
  if (includeList.includes("contributors")) {
    include.push(`
      project_collaborators(
        contributor:users(
          user_id,
          username,
          fullname,
          email,
          profile_image_url,
          role
        )
      )
    `);
  }
  if (includeList.includes("comments")) {
    include.push(`
      comments(
        comment_id,
        message,
        commented_at,
        user:users(
          user_id,
          username,
          fullname,
          email,
          profile_image_url,
          role
        )
      )
    `);
  }

  // Always include certification data
  include.push(`
    certifications(
      certification_date,
      professor:professors(
        user_id,
        position,
        department,
        faculty,
        user:users(
          fullname,
          email,
          profile_image_url
        )
      )
    )
  `);

  // Always include likes data
  include.push(`
    likes(
      user:users(
        user_id,
        username,
        fullname,
        profile_image_url
      )
    )
  `);

  return [base, ...include].join(",");
}

/** Parameters accepted by listProjects() */
export type ListParams = {
  q?: string;
  badge?: string;
  statusList?: string[];
  from?: string;
  to?: string;
  contributors?: string[]; // user_id[]
  orderBy?: string;
  order?: "asc" | "desc";
  page: number;
  pageSize: number;
  include: IncludeKey[];
};

/** Calculate pagination range */
export function calcRange(page: number, pageSize: number) {
  const p = Math.max(1, page);
  const take = Math.min(100, Math.max(1, pageSize));
  const fromIdx = (p - 1) * take;
  const toIdx = fromIdx + take - 1;
  return { p, take, fromIdx, toIdx };
}

/**
 * Calculate monthly stats for the previous calendar month.
 * Expects monthlyStats items to have a `month` field in "YYYY-MM" format.
 */
export function calcMonthlyStats(monthlyStats: any[]) {
  const now = new Date();
  // previous calendar month: if now is January, previous month is December of previous year
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1; // 1-based month

  const stats = (monthlyStats ?? []).filter((s: any) => {
    if (!s?.month) return false;
    const parts = String(s.month).split("-");
    if (parts.length < 2) return false;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(y) || Number.isNaN(m)) return false;
    return y === prevYear && m === prevMonth;
  });

  return {
    monthly_view_count: stats.reduce(
      (sum: number, s: any) => sum + (s.views ?? 0),
      0,
    ),
    monthly_like_count: stats.reduce(
      (sum: number, s: any) => sum + (s.likes ?? 0),
      0,
    ),
  };
}

/**
 * Calculate yearly stats for the previous calendar year.
 * Expects yearlyStats items to have a `month` field in "YYYY-MM" format.
 * Includes all months that belong to the previous year.
 */
export function calcYearlyStats(yearlyStats: any[]) {
  const now = new Date();
  const prevYear = now.getFullYear() - 1;

  const stats = (yearlyStats ?? []).filter((s: any) => {
    if (!s?.month) return false;
    const parts = String(s.month).split("-");
    if (parts.length < 1) return false;
    const y = Number(parts[0]);
    if (Number.isNaN(y)) return false;
    return y === prevYear;
  });

  return {
    yearly_view_count: stats.reduce(
      (sum: number, s: any) => sum + (s.views ?? 0),
      0,
    ),
    yearly_like_count: stats.reduce(
      (sum: number, s: any) => sum + (s.likes ?? 0),
      0,
    ),
  };
}

/** Map raw Supabase row to structured API response */
export function mapProjectRow(
  row: any,
  includeList?: IncludeKey[],
  withStats = false,
  currentUserId?: string,
) {
  const result: any = {
    projectId: row.project_id,
    title: row.title,
    badge: row.badge,
    status: row.status,
    previewImageUrl: row.preview_image_url ?? null,
    shortDescription: row.short_description ?? null,
    content: row.content ?? null,
    likeCount: row.like_count ?? 0,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Add monthly/yearly stats if requested
  if (withStats && row.project_stats_monthly) {
    const monthlyStats = calcMonthlyStats(row.project_stats_monthly);
    const yearlyStats = calcYearlyStats(row.project_stats_monthly);

    result.monthlyViewCount = monthlyStats.monthly_view_count;
    result.monthlyLikeCount = monthlyStats.monthly_like_count;
    result.yearlyViewCount = yearlyStats.yearly_view_count;
    result.yearlyLikeCount = yearlyStats.yearly_like_count;
  }

  // Only include if specified in includeList
  if (includeList?.includes("categories")) {
    result.categories = (row.project_categories ?? [])
      .map((pc: any) => pc?.category)
      .filter(Boolean)
      .map((c: any) => ({
        categoryId: c.category_id,
        categoryName: c.category_name,
      }));
  }

  if (includeList?.includes("links")) {
    result.externalLinks = (row.project_external_links ?? []).map(
      (l: any) => l.link_url,
    );
  }

  if (includeList?.includes("files")) {
    result.files = (row.project_files ?? []).map((f: any) => ({
      fileId: f.file_id,
      fileUrl: f.file_url,
    }));
  }

  if (includeList?.includes("contributors")) {
    result.contributors = (row.project_collaborators ?? [])
      .map((pc: any) => pc?.contributor)
      .filter(Boolean)
      .map((c: any) => ({
        userId: c.user_id,
        username: c.username,
        fullname: c.fullname,
        email: c.email,
        profileImageUrl: c.profile_image_url ?? null,
        role: c.role,
      }));
  }

  if (includeList?.includes("comments")) {
    result.comments = (row.comments ?? []).map((c: any) => ({
      commentId: c.comment_id,
      message: c.message,
      commentedAt: c.commented_at,
      user: c.user
        ? {
            userId: c.user.user_id,
            username: c.user.username,
            fullname: c.user.fullname,
            email: c.user.email,
            profileImageUrl: c.user.profile_image_url ?? null,
            role: c.user.role,
          }
        : null,
    }));
  }

  // Always include certification data (if exists)
  result.certifiedBy = (row.certifications ?? [])
    .filter((cert: any) => cert?.professor)
    .map((cert: any) => ({
      userId: cert.professor.user_id,
      fullname: cert.professor.user?.fullname,
      email: cert.professor.user?.email,
      profileImageUrl: cert.professor.user?.profile_image_url ?? null,
      position: cert.professor.position,
      department: cert.professor.department,
      faculty: cert.professor.faculty,
      certificationDate: cert.certification_date,
    }));

  // Always include like data
  const likes = (row.likes ?? [])
    .filter((like: any) => like?.user)
    .map((like: any) => ({
      userId: like.user.user_id,
      username: like.user.username ?? null,
      fullname: like.user.fullname,
      profileImageUrl: like.user.profile_image_url ?? null,
    }));

  result.likedByUsers = likes;
  result.isLikedByCurrentUser = currentUserId
    ? likes.some((like: any) => like.userId === currentUserId)
    : false;

  return result;
}
