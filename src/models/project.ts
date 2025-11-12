import { z } from "zod";

export const ProjectListQuerySchema = z.object({
  q: z.string().max(200).optional(),
  badge: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  contributors: z.string().optional(),
  orderBy: z
    .enum([
      "created_at",
      "updated_at",
      "title",
      "like_count",
      "view_count",
      "monthly_like_count",
      "monthly_view_count",
      "yearly_like_count",
      "yearly_view_count",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional(),
  include: z
    .union([
      z
        .string()
        .regex(
          /^(categories|links|files|contributors)(,(categories|links|files|contributors))*$/,
          "Invalid include format",
        ),
      z.array(z.enum(["categories", "links", "files", "contributors"])),
    ])
    .optional()
    .describe(
      "Comma-separated list of relations to include. Allowed values: categories, links, files, contributors. Example: categories,links,files,contributors",
    ),
});

export const ProjectIdParamsSchema = z.object({
  id: z.string(),
});

export const ProjectDetailsResSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  badge: z.string(),
  status: z.enum(["Draft", "Published", "Certified"]),
  previewImageUrl: z.string().nullable(),
  shortDescription: z.string().nullable(),
  content: z.string().nullable(),
  categories: z
    .array(
      z.object({
        categoryId: z.string(),
        categoryName: z.string(),
      }),
    )
    .default([]),
  externalLinks: z.array(z.string()).default([]),
  files: z
    .array(
      z.object({
        fileId: z.string(),
        fileUrl: z.string(),
      }),
    )
    .default([]),
  contributors: z
    .array(
      z.object({
        userId: z.string(),
        username: z.string().nullable(),
        fullname: z.string(),
        email: z.string(),
        profileImageUrl: z.string().nullable(),
        role: z.enum(["admin", "contributor", "visitor"]),
      }),
    )
    .default([]),
  likeCount: z.number(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateProjectBodySchema = z.object({
  title: z.string().min(1).max(100),
  badge: z.string().min(1),
  content: z.string().optional(),
  preview_image_url: z.string().optional(),
  short_description: z.string().max(200).optional(),
  status: z.enum(["Draft", "Published", "Certified"]).optional(),
});

export const UpdateProjectBodySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  badge: z.string().min(1).optional(),
  content: z.string().optional(),
  preview_image_url: z.string().optional(),
  short_description: z.string().max(200).optional(),
  status: z.enum(["Draft", "Published", "Certified"]).optional(),
});
