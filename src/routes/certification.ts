import { Elysia } from "elysia";
import * as t from "zod";
import { supabase } from "../lib/supabase";
import {
  deleteMyCertification,
  ensureProfessor,
  ensureProjectExists,
  listCertificationsByProjectWithProfessor,
  upsertCertification,
} from "../services/certification";
import { authenticateUser } from "../utils/auth";
import { AppError } from "../utils/errors";
import { IsoStringOptional, Uuid } from "../utils/validation";

export const certificationRoutes = new Elysia({ prefix: "/api" })
  // POST /api/certifications
  .post(
    "/certifications",
    async ({ headers, body }) => {
      const auth = await authenticateUser(headers.authorization);
      console.log("auth", auth);
      console.log("auth token", headers.authorization);
      if (!auth.success) throw AppError.unauthorized(auth.error.message);

      const userId = auth.user.id;

      // Ensure the professor is certify by themselves
      if (userId !== body.professorUserId) {
        throw AppError.forbidden(
          "professorUserId must match authenticated user",
        );
      }

      await ensureProjectExists(supabase, body.projectId);
      await ensureProfessor(supabase, userId);

      const row = await upsertCertification(
        supabase,
        body.projectId,
        userId,
        body.certificationDate,
      );

      return { success: true, data: row };
    },
    {
      body: t.object({
        projectId: Uuid,
        professorUserId: Uuid,
        certificationDate: IsoStringOptional,
      }),
      detail: {
        summary: "Certify a project (multiple professors allowed)",
        tags: ["Certifications"],
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // DELETE /api/certifications/:projectId/me
  .delete(
    "/certifications/:projectId/me",
    async ({ headers, params }) => {
      const auth = await authenticateUser(headers.authorization);
      if (!auth.success) throw AppError.unauthorized(auth.error.message);

      await ensureProfessor(supabase, auth.user.id);
      await ensureProjectExists(supabase, params.projectId);

      const res = await deleteMyCertification(
        supabase,
        params.projectId,
        auth.user.id,
      );
      return res;
    },
    {
      params: t.object({ projectId: Uuid }),
      detail: {
        summary: "Revoke my certification",
        tags: ["Certifications"],
        security: [{ bearerAuth: [] }],
      },
    },
  )

  // GET /api/projects/:projectId/certifications
  .get(
    "/projects/:projectId/certifications",
    async ({ params }) => {
      await ensureProjectExists(supabase, params.projectId);
      const rows = await listCertificationsByProjectWithProfessor(
        supabase,
        params.projectId,
      );
      return { success: true, data: rows };
    },
    {
      params: t.object({ projectId: Uuid }),
      detail: {
        summary: "List certifying professors for a project",
        tags: ["Certifications"],
      },
    },
  );
