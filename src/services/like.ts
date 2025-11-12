// src/services/like.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../lib/database.types";

type DB = SupabaseClient<Database>;


export async function toggleLike(
  supabase: DB,
  userId: string,
  projectId: string
) {
  // is there a like already?
  const { data: existing, error: checkError } = await supabase
    .from("likes")
    .select("user_id, project_id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("project_id", projectId);
    if (error) throw error;
    return { liked: false, message: "Unliked successfully" };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, project_id: projectId });
    if (error) throw error;
    return { liked: true, message: "Liked successfully" };
  }
}
