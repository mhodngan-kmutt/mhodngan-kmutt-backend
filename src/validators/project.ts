import { t } from "elysia";

// Project Status Schema
const ProjectStatus = t.Union([
  t.Literal("Draft"),
  t.Literal("Published"),
  t.Literal("Certified"),
]);

// Create Project Schema
export const CreateProjectSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 100 }),
  badge: t.String({ minLength: 1 }),
  content: t.Optional(t.String()),
  preview_image_url: t.Optional(t.String()),
  short_description: t.Optional(t.String({ maxLength: 200 })),
  status: t.Optional(ProjectStatus),
});

// Update Project Schema
export const UpdateProjectSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  badge: t.Optional(t.String({ minLength: 1 })),
  content: t.Optional(t.String()),
  preview_image_url: t.Optional(t.String()),
  short_description: t.Optional(t.String({ maxLength: 200 })),
  status: t.Optional(ProjectStatus),
});
