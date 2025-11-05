import { z } from 'zod';

// Request schema for fetching project details
export const ProjectDetailsReqSchema = z.object({
  projectId: z.string().uuid()
})
export type ProjectDetailsReq = z.infer<typeof ProjectDetailsReqSchema>


// Response schema for project details
export const ProjectDetailsResSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string(),  
  badge: z.string(),
  status: z.enum(['Draft', 'Published', 'Certified']),
  previewImageUrl: z.string().nullable(),
  shortDescription: z.string().nullable(),
  content: z.string().nullable(),
  categories: z.array(z.object({
    categoryId: z.string().uuid(),
    categoryName: z.string()
  })).default([]),
  externalLinks: z.array(z.string()).default([]),
  files: z.array(z.object({
    fileId: z.string().uuid(),
    fileUrl: z.string()
  })).default([]),
  likeCount: z.number(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
})
export type ProjectDetailsRes = z.infer<typeof ProjectDetailsResSchema>

// Response schema for project card (a subset of project details)
export const ProjectCardResSchema = ProjectDetailsResSchema.pick({
  projectId: true, title: true, badge: true, status: true,
  previewImageUrl: true, shortDescription: true, categories: true,
  likeCount: true, viewCount: true
})
