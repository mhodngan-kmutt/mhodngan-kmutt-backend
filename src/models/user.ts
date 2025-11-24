import { z } from "zod";

export const UserProfileResSchema = z.object({
  userId: z.string(),
  username: z.string().nullable(),
  fullname: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable(),
  role: z.enum(["professor", "contributor", "visitor"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
