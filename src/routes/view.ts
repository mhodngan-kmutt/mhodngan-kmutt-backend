import { Elysia, t } from "elysia";
import { supabase } from "../lib/supabase";
import { recordView, countViews, listViews } from "../services/view";
import { AppError } from "../utils/errors";

export const viewRoutes = new Elysia({ prefix: "/api" })
      .post(
        "/views",
        async ({ body, set }) => {
          try {
            const row = await recordView(supabase, body as any);
            return { ok: true, row };
          } catch (e: any) {
            if (e instanceof AppError) {
                set.status = e.status;
                return { ok: false, error: e.message };
            }
            set.status = 400;
            return { ok: false, error: e.message };
          }
        },
        {
          body: t.Object({
            user_id: t.String(),       
            project_id: t.String(),    
          }),
        }
      )
      .get(
        "/views/:projectId/count",
        async ({ params, set }) => {
          try {
            const data = await countViews(supabase, params.projectId);
            return { ok: true, ...data };
          } catch (e: any) {
            set.status = 400;
            return { ok: false, error: e.message };
          }
        },
        { params: t.Object({ projectId: t.String() }) }
      )
      .get(
        "/views/:projectId/recent",
        async ({ params, query, set }) => {
          try {
            const limit = Math.min(Number(query.limit ?? 20), 100);
            const rows = await listViews(supabase, params.projectId, limit);
            return { ok: true, rows };
          } catch (e: any) {
            set.status = 400;
            return { ok: false, error: e.message };
          }
        },
        {
          params: t.Object({ projectId: t.String() }),
          query: t.Object({ limit: t.Optional(t.String()) }),
        }
      )
  ;
