import Elysia, { t } from "elysia";
import { supabase } from "../lib/supabase";
import {
  addComment,
  deleteOwnComment,
  listCommentsByProject,
} from "../services/comment";
import { authenticateUser } from "../utils/auth";
import { AppError } from "../utils/errors";

export const commentRoutes = new Elysia({ prefix: "/comment" })
  // Create a new comment
  .post(
    "/",
    async ({ headers, body }) => {
      const auth = await authenticateUser(headers.authorization);
      if (!auth.success) throw AppError.unauthorized(auth.error.message);

      const userId = auth.user.id;
      const projectId = body.project_id;

      const created = await addComment(supabase, {
        userId,
        projectId,
        message: body.message,
      });

      return {
        ok: true,
        data: { ...created, commented_at: created.commented_at ?? "" },
      };
    },
    {
      body: t.Object({
        project_id: t.String({ format: "uuid" }),
        message: t.String({ minLength: 1, maxLength: 4000 }),
      }),
      response: t.Object({
        ok: t.Literal(true),
        data: t.Object({
          comment_id: t.String(),
          project_id: t.String(),
          user_id: t.String(),
          message: t.String(),
          commented_at: t.String(),
        }),
      }),
      detail: {
        summary: "Create comment",
        description:
          "Add a new comment to a project. Requires authentication. Comment length: 1-4000 characters.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // Delete own comment
  .delete(
    "/:commentId",
    async ({ params, headers }) => {
      const auth = await authenticateUser(headers.authorization);
      if (!auth.success) throw AppError.unauthorized(auth.error.message);

      await deleteOwnComment(supabase, { commentId: params.commentId });
      return { ok: true };
    },
    {
      params: t.Object({ commentId: t.String({ format: "uuid" }) }),
      detail: {
        summary: "Delete own comment",
        description:
          "Delete a comment. Only the comment author can delete their own comments (enforced via RLS). Requires authentication.",
        tags: ["Comments"],
        security: [{ bearerAuth: [] }],
      },
    },
  );

// Project-related comment endpoint (under /project prefix)
export const projectCommentRoutes = new Elysia().get(
  "/project/:id/comments",
  async ({ params, query }) => {
    const limit = query.limit ? Number(query.limit) : undefined;
    const { items, totalCount, nextCursor } = await listCommentsByProject(
      supabase,
      params.id,
      { limit, cursor: query.cursor },
    );
    return { ok: true, totalCount, data: items, nextCursor };
  },
  {
    params: t.Object({ id: t.String({ format: "uuid" }) }),
    query: t.Object({
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
    }),
    detail: {
      summary: "Get project comments",
      description:
        "Retrieve all comments for a specific project with pagination support. Use cursor for pagination. Public access.",
      tags: ["Projects", "Comments"],
    },
  },
);
