import Elysia from "elysia";
import { supabase } from "../lib/supabase";
import { AppError } from "../utils/errors";
import {
  ProjectListQuerySchema,
  ProjectIdParamsSchema,
  ProjectDetailsResSchema,
  CreateProjectBodySchema,
  UpdateProjectBodySchema,
} from "../models/project";
import { csv, type IncludeKey } from "../utils/project.query";
import {
  getProjectById,
  listProjects,
  getUserProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project";
import { authenticateUser } from "../utils/auth";

export const projectRoutes = new Elysia({ prefix: "/project" })
  // Get all projects with optional filters
  .get(
    "/",
    async ({ query }) => {
      const include = (
        Array.isArray(query.include)
          ? query.include
          : csv(query.include)
      ) as IncludeKey[];
      const statusList = csv(query.status);

      return await listProjects(supabase, {
        ...query,
        statusList: statusList.length ? statusList : ["Published"],
        contributors: csv(query.contributors),
        orderBy: query.orderBy ?? "updated_at",
        order: query.order ?? "desc",
        page: query.page ? Number(query.page) : 1,
        pageSize: query.pageSize ? Number(query.pageSize) : 20,
        include: include.length
          ? include
          : ["categories", "links", "files", "contributors"],
      });
    },
    {
      query: ProjectListQuerySchema,
      detail: {
        summary: "Get all projects",
        description:
          "Retrieve a paginated list of projects. Defaults to 'Published' status only. Supports filtering by status, badge, search query, contributors, and date range. Supports sorting and customizable includes (categories, links, files, contributors). Default includes: categories, links, files, contributors. Public access.",
        tags: ["Projects"],
      },
    }
  )

  // Get authenticated user's projects
  .get(
    "/me",
    async ({ headers }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        throw AppError.unauthorized(auth.error.message);
      }

      return await getUserProjects(supabase, auth.user.id, [
        "categories",
        "links",
        "files",
      ]);
    },
    {
      detail: {
        summary: "Get my projects",
        description:
          "Retrieve all projects where the authenticated user is a collaborator. Requires authentication.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Get project details by ID
  .get(
    "/:id",
    async ({ params, query }) => {
      const include = (
        Array.isArray(query.include)
          ? query.include
          : csv(query.include)
      ) as IncludeKey[];

      const project = await getProjectById(
        supabase,
        params.id,
        include.length
          ? include
          : ["categories", "links", "files", "contributors"]
      );
      if (!project) throw AppError.notFound("Project not found");

      return ProjectDetailsResSchema.parse(project);
    },
    {
      params: ProjectIdParamsSchema,
      query: ProjectListQuerySchema.pick({ include: true }),
      detail: {
        summary: "Get project details by ID",
        description:
          "Retrieve detailed information about a specific project by ID. Supports optional includes: categories, links, files, contributors. Default: categories, links, files. Public access.",
        tags: ["Projects"],
      },
    }
  )

  // Create new project
  .post(
    "/",
    async ({ headers, body }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        throw AppError.unauthorized(auth.error.message);
      }

      const project = await createProject(supabase, auth.user.id, body);

      return project;
    },
    {
      body: CreateProjectBodySchema,
      detail: {
        summary: "Create new project",
        description:
          "Create a new project and automatically add the authenticated user as a collaborator. Requires authentication.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Update existing project
  .patch(
    "/:id",
    async ({ headers, params, body }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        throw AppError.unauthorized(auth.error.message);
      }

      try {
        const project = await updateProject(
          supabase,
          params.id,
          auth.user.id,
          body
        );

        return project;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("permission to update")
        ) {
          throw AppError.forbidden(error.message);
        }
        throw error;
      }
    },
    {
      params: ProjectIdParamsSchema,
      body: UpdateProjectBodySchema,
      detail: {
        summary: "Update project",
        description:
          "Update an existing project. Only collaborators can update. Requires authentication.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Delete project
  .delete(
    "/:id",
    async ({ headers, params }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        throw AppError.unauthorized(auth.error.message);
      }

      try {
        await deleteProject(supabase, params.id, auth.user.id);

        return { success: true, message: "Project deleted successfully" };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("permission to delete")
        ) {
          throw AppError.forbidden(error.message);
        }
        throw error;
      }
    },
    {
      params: ProjectIdParamsSchema,
      detail: {
        summary: "Delete project",
        description:
          "Delete an existing project. Only collaborators can delete. Requires authentication.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  );
