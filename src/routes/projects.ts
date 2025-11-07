import { Elysia } from "elysia";
import { supabase } from "../lib/supabase";
import { authenticateUser } from "../utils/auth";
import type { ApiResponse, Project } from "../types/api";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "../validators/project";

export const projectRoutes = new Elysia({ prefix: "/projects" })
  // Get all published projects (public access)
  .get(
    "/",
    async ({ set }) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "Published");

      if (error) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to fetch projects",
          error: error.message,
        };
      }

      return {
        status: "ok",
        message: "Projects fetched successfully",
        data,
      };
    },
    {
      detail: {
        summary: "Get all published projects",
        description:
          "Retrieve all projects with status 'Published'. Public access, no authentication required.",
        tags: ["Projects"],
      },
    }
  )
  // Get all projects where user is collaborator (authenticated)
  .get(
    "/me",
    async ({ headers, set }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        set.status = auth.error.status;
        return {
          status: "error",
          message: auth.error.message,
          error: auth.error.details,
        };
      }

      console.log(auth.user.id);

      const { data, error } = await auth.userSupabase
        .from("project_collaborators")
        .select("projects(*)")
        .eq("contributor_user_id", auth.user.id);

      if (error) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to fetch user projects",
          error: error.message,
        };
      }

      return {
        status: "ok",
        message: "User projects fetched successfully",
        data,
      };
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
  // Get single project by ID (public access)
  .get(
    "/:id",
    async ({ set, params }) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("project_id", params.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          set.status = 404;
          return {
            status: "error",
            message: "Project not found",
          };
        }

        set.status = 500;
        return {
          status: "error",
          message: "Failed to fetch project",
          error: error.message,
        };
      }

      return {
        status: "ok",
        message: "Project fetched successfully",
        data,
      };
    },
    {
      detail: {
        summary: "Get project by ID",
        description:
          "Retrieve a single project by its ID. Public access, no authentication required.",
        tags: ["Projects"],
      },
    }
  )
  // Create new project and add creator as collaborator (authenticated)
  .post(
    "/",
    async ({ headers, set, body }): Promise<ApiResponse<Project>> => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        set.status = auth.error.status;
        return {
          status: "error",
          message: auth.error.message,
          error: auth.error.details,
        };
      }

      const { data: project, error: projectError } = await auth.userSupabase
        .from("projects")
        .insert(body)
        .select()
        .single();

      if (projectError) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to create project",
          error: projectError.message,
        };
      }

      const { error: collaboratorError } = await auth.userSupabase
        .from("project_collaborators")
        .insert({
          project_id: project.project_id,
          contributor_user_id: auth.user.id,
        });

      if (collaboratorError) {
        await auth.userSupabase
          .from("projects")
          .delete()
          .eq("project_id", project.project_id);

        set.status = 500;
        return {
          status: "error",
          message: "Failed to add collaborator",
          error: collaboratorError.message,
        };
      }

      set.status = 201;
      return {
        status: "ok",
        message: "Project created successfully",
        data: project,
      };
    },
    {
      body: CreateProjectSchema,
      detail: {
        summary: "Create new project",
        description:
          "Create a new project and automatically add the creator as a collaborator. Requires authentication.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  )
  // Update project (authenticated, collaborators)
  .patch(
    "/:id",
    async ({ headers, set, params, body }): Promise<ApiResponse<Project>> => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        set.status = auth.error.status;
        return {
          status: "error",
          message: auth.error.message,
          error: auth.error.details,
        };
      }

      const { data, error } = await auth.userSupabase
        .from("projects")
        .update(body)
        .eq("project_id", params.id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          set.status = 404;
          return {
            status: "error",
            message:
              "Project not found or you don't have permission to update it",
          };
        }

        set.status = 500;
        return {
          status: "error",
          message: "Failed to update project",
          error: error.message,
        };
      }

      return {
        status: "ok",
        message: "Project updated successfully",
        data,
      };
    },
    {
      body: UpdateProjectSchema,
      detail: {
        summary: "Update project",
        description:
          "Update an existing project. Requires authentication. Only collaborators can update via RLS policy.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  )
  // Delete project (authenticated, collaborators)
  .delete(
    "/:id",
    async ({ headers, set, params }) => {
      const auth = await authenticateUser(headers.authorization);

      if (!auth.success) {
        set.status = auth.error.status;
        return {
          status: "error",
          message: auth.error.message,
          error: auth.error.details,
        };
      }

      const { error } = await auth.userSupabase
        .from("projects")
        .delete()
        .eq("project_id", params.id);

      if (error) {
        set.status = 500;
        return {
          status: "error",
          message: "Failed to delete project",
          error: error.message,
        };
      }

      return {
        status: "ok",
        message: "Project deleted successfully",
      };
    },
    {
      detail: {
        summary: "Delete project",
        description:
          "Delete an existing project. Requires authentication. Only collaborators can delete via RLS policy.",
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
      },
    }
  );
