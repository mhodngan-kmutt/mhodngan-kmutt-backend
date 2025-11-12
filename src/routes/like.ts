// src/routes/like.routes.ts
import { Elysia } from "elysia";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { toggleLike } from "../services/like";

const LikeBody = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
});
type LikeBody = z.infer<typeof LikeBody>;

export const likeRoutes = new Elysia().post(
  "/likes", async ({ body }) => {
  const { user_id, project_id } = LikeBody.parse(body);

  const result = await toggleLike(supabase, user_id, project_id);

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project_id);

  return { ...result, like_count: count ?? 0 };
});