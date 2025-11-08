import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import type { IncludeKey, ListParams } from "../utils/project.query";
import {
  buildSelect,
  calcRange,
  mapProjectRow,
  safeOrder,
} from "../utils/project.query";

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  id: string,
  include: IncludeKey[] = ["categories", "links", "files"]
) {
  const { data, error } = await supabase
    .from("projects")
    .select(buildSelect(include))
    .eq("project_id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapProjectRow(data, include);
}

export async function listProjects(
  supabase: SupabaseClient<Database>,
  params: ListParams
) {
  const { p, take, fromIdx, toIdx } = calcRange(params.page, params.pageSize);
  const { field, ascending } = safeOrder(params.orderBy, params.order);

  // Base query
  let q = supabase.from("projects").select(buildSelect(params.include));

  // Search
  if (params.q)
    q = q.or(`title.ilike.%${params.q}%,content.ilike.%${params.q}%`);

  // Badge filter
  if (params.badge) q = q.eq("badge", params.badge);

  // Status filter
  if (params.statusList?.length) q = q.in("status", params.statusList);

  // Date range
  if (params.from) q = q.gte("created_at", params.from);
  if (params.to) q = q.lt("created_at", params.to);

  // Contributor filter (requires join table)
  if (params.contributors?.length) {
    q = q
      .select(
        buildSelect(params.include) + ",project_contributors!inner(user_id)"
      )
      .in("project_contributors.user_id", params.contributors);
  }

  // Pagination & sort
  const { data, error, count } = await q
    .order(field, { ascending })
    .range(fromIdx, toIdx);

  if (error) throw error;

  const rows = (data ?? []).map((row) => mapProjectRow(row, params.include));
  return {
    meta: {
      page: p,
      pageSize: take,
      total: count ?? rows.length,
      totalPages: Math.ceil((count ?? rows.length) / take),
      sort: { orderBy: field, order: ascending ? "asc" : "desc" },
    },
    data: rows,
  };
}

export async function getUserProjects(
  supabase: SupabaseClient<Database>,
  userId: string,
  include: IncludeKey[] = ["categories", "links", "files"]
) {
  const { data, error } = await supabase
    .from("project_collaborators")
    .select(`projects(${buildSelect(include)})`)
    .eq("contributor_user_id", userId);

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
    .insert(projectData)
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
    .update(projectData)
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

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;

  return { success: true };
}
