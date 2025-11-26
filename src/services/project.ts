import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import type { IncludeKey, ListParams } from "../utils/project.query";
import {
  buildSelect,
  calcRange,
  mapProjectRow,
  needsStatsData,
  safeOrder,
} from "../utils/project.query";

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  id: string,
  include: IncludeKey[] = ["categories", "links", "files"],
  currentUserId?: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select(buildSelect(include))
    .eq("project_id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const project = mapProjectRow(data, include, false, currentUserId);

  // Fetch related projects based on matching categories
  let relatedProjects: any[] = [];
  if (include.includes("categories") && project.categories?.length) {
    const categoryIds = project.categories.map((c: any) => c.categoryId);

    // Get projects that share at least one category
    const { data: relatedData } = await supabase
      .from("projects")
      .select(
        `
        project_id,
        title,
        badge,
        preview_image_url,
        short_description,
        like_count,
        view_count,
        project_categories!inner(category_id)
      `
      )
      .in("project_categories.category_id", categoryIds)
      .neq("project_id", id)
      .eq("status", "Published")
      .is("deleted_at", null)
      .order("like_count", { ascending: false })
      .limit(8);

    if (relatedData) {
      relatedProjects = relatedData.map((p: any) => ({
        projectId: p.project_id,
        title: p.title,
        badge: p.badge,
        previewImageUrl: p.preview_image_url,
        shortDescription: p.short_description,
        likeCount: p.like_count ?? 0,
        viewCount: p.view_count ?? 0,
      }));
    }
  }

  return {
    ...project,
    relatedProjects,
  };
}

export async function listProjects(
  supabase: SupabaseClient<Database>,
  params: ListParams
) {
  const { p, take, fromIdx, toIdx } = calcRange(params.page, params.pageSize);
  const { field, ascending } = safeOrder(params.orderBy, params.order);
  const needStats = needsStatsData(params.orderBy);

  // Base query - exclude soft deleted projects
  let q = supabase
    .from("projects")
    .select(buildSelect(params.include, needStats))
    .is("deleted_at", null);

  // Search
  if (params.q)
    q = q.or(`title.ilike.%${params.q}%,content.ilike.%${params.q}%`);

  // Badge filter
  if (params.badge) q = q.eq("badge", params.badge as any);

  // Status filter
  if (params.statusList?.length) q = q.in("status", params.statusList as any);

  // Date range
  if (params.from) q = q.gte("created_at", params.from);
  if (params.to) q = q.lt("created_at", params.to);

  // Contributor filter (requires join table)
  if (params.contributors?.length) {
    q = q
      .select(
        buildSelect(params.include, needStats) +
          ",project_contributors!inner(user_id)"
      )
      .in("project_contributors.user_id", params.contributors);
  }

  // Pagination & sort
  // If ordering by stats, we need to sort in-memory after calculating stats
  let result: { data: unknown[]; count: number; rows?: unknown[] };
  if (needStats) {
    // Get all matching records without pagination
    const { data, error, count } = await q;
    if (error) throw error;

    // Map and calculate stats for each row
    const rows = (data ?? []).map((row) => {
      const mapped = mapProjectRow(row, params.include, true);
      return mapped;
    });

    // Sort in-memory based on the stats field
    rows.sort((a, b) => {
      let aVal = 0,
        bVal = 0;
      if (field === "monthly_view_count") {
        aVal = a.monthlyViewCount ?? 0;
        bVal = b.monthlyViewCount ?? 0;
      } else if (field === "monthly_like_count") {
        aVal = a.monthlyLikeCount ?? 0;
        bVal = b.monthlyLikeCount ?? 0;
      } else if (field === "yearly_view_count") {
        aVal = a.yearlyViewCount ?? 0;
        bVal = b.yearlyViewCount ?? 0;
      } else if (field === "yearly_like_count") {
        aVal = a.yearlyLikeCount ?? 0;
        bVal = b.yearlyLikeCount ?? 0;
      }
      return ascending ? aVal - bVal : bVal - aVal;
    });

    // Apply pagination manually
    const paginatedRows = rows.slice(fromIdx, toIdx + 1);

    result = {
      data: paginatedRows,
      count: count ?? rows.length,
      rows,
    };
  } else {
    // Normal database ordering
    const { data, error, count } = await q
      .order(field, { ascending })
      .range(fromIdx, toIdx);

    if (error) throw error;

    const rows = (data ?? []).map((row) =>
      mapProjectRow(row, params.include, false)
    );
    result = { data: rows, count: count ?? rows.length, rows };
  }

  return {
    meta: {
      page: p,
      pageSize: take,
      total: result.count,
      totalPages: Math.ceil(result.count / take),
      sort: { orderBy: field, order: ascending ? "asc" : "desc" },
    },
    data: result.data,
  };
}

export async function getUserProjects(
  supabase: SupabaseClient<Database>,
  userId: string,
  include: IncludeKey[] = ["categories", "links", "files"]
) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .select(`projects!inner(${buildSelect(include)})`)
    .eq("contributor_user_id", userId)
    .is("projects.deleted_at", null);

  if (error) throw error;

  const projects = (data ?? [])
    .map((item: any) => item.projects)
    .filter(Boolean)
    .map((row) => mapProjectRow(row, include));

  return { data: projects };
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectData: {
    title: string;
    badge: string;
    content?: string;
    preview_image_url?: string;
    short_description?: string;
    status?: "Draft" | "Published" | "Certified";
  }
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert(projectData as any)
    .select()
    .single();

  if (projectError) throw projectError;

  const { error: collaboratorError } = await supabase
    .from("project_collaborators")
    .insert({
      project_id: project.project_id,
      contributor_user_id: userId,
    });

  if (collaboratorError) {
    await supabase
      .from("projects")
      .delete()
      .eq("project_id", project.project_id);
    throw collaboratorError;
  }

  return project;
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  userId: string,
  projectData: {
    title?: string;
    badge?: string;
    content?: string;
    preview_image_url?: string;
    short_description?: string;
    status?: "Draft" | "Published" | "Certified";
  }
) {
  const { data: collaborator } = await supabase
    .from("project_collaborators")
    .select("*")
    .eq("project_id", projectId)
    .eq("contributor_user_id", userId)
    .maybeSingle();

  if (!collaborator) {
    throw new Error("You don't have permission to update this project");
  }

  const { data, error } = await supabase
    .from("projects")
    .update(projectData as any)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  userId: string
) {
  const { data: collaborator } = await supabase
    .from("project_collaborators")
    .select("*")
    .eq("project_id", projectId)
    .eq("contributor_user_id", userId)
    .maybeSingle();

  if (!collaborator) {
    throw new Error("You don't have permission to delete this project");
  }

  // Soft delete: set deleted_at to now
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() } as any)
    .eq("project_id", projectId);

  if (error) throw error;

  return { success: true };
}
