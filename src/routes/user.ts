import Elysia from "elysia";
import { supabase } from "../lib/supabase";
import { AppError } from "../utils/errors";
import { UserProfileResSchema } from "../models/user";
import { getUserByProfile } from "../services/user";
import { authenticateUser } from "../utils/auth";

export const userRoutes = new Elysia({ prefix: "/user" })
  // Get authenticated user's profile
  .get(
    "/me",
    async ({ headers }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        throw AppError.unauthorized(auth.error.message);
      }

      const user = await getUserByProfile(supabase, auth.user.id);

      if (!user) throw AppError.notFound("User not found");

      return UserProfileResSchema.parse({
        userId: user.user_id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        profileImageUrl: user.profile_image_url,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    },
    {
      detail: {
        summary: "Get my profile",
        description:
          "Retrieve the authenticated user's profile information. Requires authentication.",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
      },
    }
  );
