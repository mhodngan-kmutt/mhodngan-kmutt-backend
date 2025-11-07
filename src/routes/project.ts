import Elysia from "elysia";
import { supabase } from "../lib/supabase";
import { AppError } from "../utils/errors";
import {
  ProjectListQuerySchema,
  ProjectIdParamsSchema,
  ProjectDetailsReqSchema,
  ProjectDetailsResSchema,
} from "../models/project";
import { csv, type IncludeKey } from "../utils/project.query";
import { getProjectById, listProjects } from "../services/project";

export const projectRoutes = new Elysia({ prefix: "/project" })

  .get(
    "/list",
    async ({ query }) => {
      const include = csv(query.include) as IncludeKey[];
      const statusList = csv(query.status);

      return await listProjects(supabase, {
        ...query,
        statusList,
        contributors: csv(query.contributors),
        orderBy: query.orderBy ?? "updated_at",
        order: query.order ?? "desc",
        page: query.page ? Number(query.page) : 1,
        pageSize: query.pageSize ? Number(query.pageSize) : 20,
        include: include.length ? include : ["categories", "links", "files"],
      });
    },
    {
      query: ProjectListQuerySchema,
    }
  )

  .post(
    "/details",
    async ({ body }) => {
      const project = await getProjectById(supabase, body.projectId, [
        "categories",
        "links",
        "files",
      ]);
      if (!project) throw AppError.notFound("Project not found");

      return ProjectDetailsResSchema.parse(project);
    },
    {
      body: ProjectDetailsReqSchema,
    }
  )

  .get(
    "/details/:id",
    async ({ params }) => {
      const project = await getProjectById(supabase, params.id, [
        "categories",
        "links",
        "files",
      ]);
      if (!project) throw AppError.notFound("Project not found");

      return ProjectDetailsResSchema.parse(project);
    },
    {
      params: ProjectIdParamsSchema,
    }
  );
