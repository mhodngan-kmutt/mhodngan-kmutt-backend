import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

export type DB = SupabaseClient<Database>;

export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type InsertComment = Database["public"]["Tables"]["comments"]["Insert"];

export async function addComment(
  supabase: DB,
  params: { userId: string; projectId: string; message: string },
): Promise<CommentRow> {
  const payload: InsertComment = {
    user_id: params.userId,
    project_id: params.projectId,
    message: params.message,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw Object.assign(new Error("Failed to add comment"), { cause: error });
  }
  return data;
}

export async function listCommentsByProject(
  supabase: DB,
  projectId: string,
  opts?: { limit?: number; cursor?: string },
): Promise<{ items: CommentRow[]; nextCursor?: string; totalCount: number }> {
  const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);

  let query = supabase
    .from("comments")
    .select("*", { count: "exact" })
    .eq("project_id", projectId)
    .order("commented_at", { ascending: false })
    .limit(limit);

  if (opts?.cursor) {
    query = query.lt("commented_at", opts.cursor);
  }

  const { data, error, count } = await query;

  if (error) {
    throw Object.assign(new Error("Failed to list comments"), { cause: error });
  }

  const nextCursor =
    data.length === limit
      ? (data[data.length - 1].commented_at ?? undefined)
      : undefined;

  return {
    items: data ?? [],
    totalCount: count ?? 0,
    nextCursor,
  };
}

export async function deleteOwnComment(
  supabase: DB,
  params: { commentId: string },
): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("comment_id", params.commentId);
  if (error) {
    throw Object.assign(new Error("Failed to delete comment"), {
      cause: error,
    });
  }
}
