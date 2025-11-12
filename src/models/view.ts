import * as z from "zod";

// Schema for recording a view
export const recordViewSchema = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

// Type for recording a view
export type RecordViewInput = z.infer<typeof recordViewSchema>;
