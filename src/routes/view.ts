import { Elysia, t } from "elysia";
import { supabase } from "../lib/supabase";
import { countViews, listViews, recordView } from "../services/view";
import { AppError } from "../utils/errors";

export const viewRoutes = new Elysia({ prefix: "/view" })
  // Record a view for a project
  .post(
    "/",
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
      detail: {
        summary: "Record project view",
        description:
          "Record a view event for a project by a user. Used for tracking project view statistics.",
        tags: ["Views"],
      },
    },
  )

  // Get view count for a project
  .get(
    "/:projectId/count",
    async ({ params, set }) => {
      try {
        const data = await countViews(supabase, params.projectId);
        return { ok: true, ...data };
      } catch (e: any) {
        set.status = 400;
        return { ok: false, error: e.message };
      }
    },
    {
      params: t.Object({ projectId: t.String() }),
      detail: {
        summary: "Get project view count",
        description:
          "Retrieve the total number of views for a specific project. Returns aggregated view statistics.",
        tags: ["Views"],
      },
    },
  )

  // Get recent views for a project
  .get(
    "/:projectId/recent",
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
      detail: {
        summary: "Get recent project views",
        description:
          "Retrieve a list of recent view events for a project. Returns up to 100 most recent views. Default limit: 20.",
        tags: ["Views"],
      },
    },
  );
