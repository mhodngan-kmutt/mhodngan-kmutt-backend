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

  return mapProjectRow(data);
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

  const rows = (data ?? []).map(mapProjectRow);
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
