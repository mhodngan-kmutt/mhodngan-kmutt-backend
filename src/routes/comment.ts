import Elysia, { t } from 'elysia';
import { addComment, listCommentsByProject, deleteOwnComment, DB } from '../services/comment';
import { supabase } from "../lib/supabase";
import { authenticateUser } from '../utils/auth';
import { AppError } from '../utils/errors';

export const commentRoutes = (app: Elysia) =>
  app.group('/api', app =>
    app
      // POST /api/comments
      .post(
        '/comments',async ({ headers, body }) => {
            const auth = await authenticateUser(headers.authorization);
            if (!auth.success) throw AppError.unauthorized(auth.error.message);
            const userId = auth.user.id;
            const projectId = body.project_id;
            const created = await addComment(supabase, {
            userId,
            projectId,
            message: body.message
          });
          // ensure commented_at is a string to satisfy the response schema
          return { ok: true, data: { ...created, commented_at: created.commented_at ?? '' } };
        },
        {
          body: t.Object({
            project_id: t.String({ format: 'uuid' }),
            message: t.String({ minLength: 1, maxLength: 4000 })
          }),
          response: t.Object({
            ok: t.Literal(true),
            data: t.Object({
              comment_id: t.String(),
              project_id: t.String(),
              user_id: t.String(),
              message: t.String(),
              commented_at: t.String()
            })
          })
        }
      )

      // GET /api/projects/:projectId/comments?limit=20&cursor=ISO8601
      .get(
        '/projects/:projectId/comments',
        async ({ params, query }) => {
            const limit = query.limit ? Number(query.limit) : undefined;
            const { items, totalCount, nextCursor} = 
            await listCommentsByProject(supabase, params.projectId, { limit, cursor: query.cursor });
            return { ok: true, totalCount, data: items,  nextCursor };
        },

        {
          params: t.Object({ projectId: t.String({ format: 'uuid' }) }),
          query: t.Object({ limit: t.Optional(t.String()), cursor: t.Optional(t.String())})
        }
      )

      // DELETE /api/comments/:commentId  (author-only via RLS)
      .delete(
        '/comments/:commentId',
        async ({ params, headers }) => {
          // RLS enforces "own comment" — but we still require user to be authed:
          const auth = await authenticateUser(headers.authorization);
          if (!auth.success) {
            throw new Error('Unauthorized');
          }
          await deleteOwnComment(supabase, { commentId: params.commentId });
          return { ok: true };
        },
        { params: t.Object({ commentId: t.String({ format: 'uuid' }) }) }
      )
  );
