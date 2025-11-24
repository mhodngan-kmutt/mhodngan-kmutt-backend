import * as z from "zod";

// Schema for liking a project
export const recordLikeSchema = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

// Type for recording a like
export type RecordLikeInput = z.infer<typeof recordLikeSchema>;
