import type { SupabaseClient } from "@supabase/supabase-js";
import { recordViewSchema, type RecordViewInput } from "../models/view";
import { AppError } from "../utils/errors";

export async function recordView(supabase: SupabaseClient, payload: RecordViewInput) {
  const input = recordViewSchema.parse(payload);

  const { data, error } = await supabase
    .from("views")
    .insert({
      user_id: input.user_id,
      project_id: input.project_id,
      viewed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw AppError.databaseError(error.message);
  return data;
}

export async function countViews(supabase: SupabaseClient, projectId: string) {
  const totalQ = supabase
    .from("views")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const uniqueUsersQ = supabase
    .from("views")
    .select("user_id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const last24hQ = supabase
    .from("views")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .gte("viewed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // last 24 hours

  const [totalRes, uniqueRes, last24hRes] = await Promise.all([totalQ, uniqueUsersQ, last24hQ]);
  if (totalRes.error) throw totalRes.error;
  if (uniqueRes.error) throw uniqueRes.error;
  if (last24hRes.error) throw last24hRes.error;

  return {
    total: totalRes.count ?? 0,
    uniqueUsers: uniqueRes.count ?? 0,
    last24h: last24hRes.count ?? 0,
  };
}

export async function listViews(
  supabase: SupabaseClient,
  projectId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from("views")
    .select("*")
    .eq("project_id", projectId)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
