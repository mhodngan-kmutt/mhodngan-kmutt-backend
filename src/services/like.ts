import type { SupabaseClient } from "@supabase/supabase-js";
import { type RecordLikeInput, recordLikeSchema } from "../models/like";
import { AppError } from "../utils/errors";

export async function toggleLike(
  supabase: SupabaseClient,
  payload: RecordLikeInput
) {
  const input = recordLikeSchema.parse(payload);

  // Check if like already exists
  const { data: existingLike, error: checkError } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", input.user_id)
    .eq("project_id", input.project_id)
    .maybeSingle();

  if (checkError) throw AppError.databaseError(checkError.message);

  // If like exists, remove it (unlike)
  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", input.user_id)
      .eq("project_id", input.project_id);

    if (deleteError) throw AppError.databaseError(deleteError.message);

    return { liked: false, message: "Project unliked successfully" };
  }

  // If like doesn't exist, create it
  const { data, error } = await supabase
    .from("likes")
    .insert({
      user_id: input.user_id,
      project_id: input.project_id,
      liked_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw AppError.databaseError(error.message);

  return { liked: true, message: "Project liked successfully", data };
}
