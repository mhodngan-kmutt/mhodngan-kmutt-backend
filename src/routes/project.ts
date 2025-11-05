import Elysia from 'elysia'
import { supabase } from '../lib/supabase'
import {
  ProjectDetailsReqSchema,
  ProjectDetailsResSchema
} from '../models/project'
import { handleError, AppError } from '../utils/errors'

export const projectRoutes = new Elysia({ prefix: '/project' })
  .post('/details', async ({ body, set }) => {
    try {
      const { projectId } = ProjectDetailsReqSchema.parse(body)
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          project_id,
          title,
          content,
          badge,
          preview_image_url,
          short_description,
          status,
          like_count,
          view_count,
          created_at,
          updated_at,
          project_categories:project_categories(
            category:categories(
              category_id,
              category_name
            )
          ),
          project_external_links(
            link_url
          ),
          project_files(
            file_id,
            file_url
          )
        `)
        .eq('project_id', projectId)
        .maybeSingle()

      if (error) throw error
      if (!data) throw AppError.notFound('Project not found')

      const response = {
        projectId: data.project_id,
        title: data.title,
        badge: data.badge,
        status: data.status,
        previewImageUrl: data.preview_image_url ?? null,
        shortDescription: data.short_description ?? null,
        content: data.content ?? null,
        categories: (data.project_categories ?? [])
          .map((pc: any) => pc?.category)
          .filter(Boolean)
          .map((c: any) => ({
            categoryId: c.category_id,
            categoryName: c.category_name
          })),
        externalLinks: (data.project_external_links ?? []).map((l: any) => l.link_url),
        files: (data.project_files ?? []).map((f: any) => ({
          fileId: f.file_id,
          fileUrl: f.file_url
        })),
        likeCount: data.like_count ?? 0,
        viewCount: data.view_count ?? 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return ProjectDetailsResSchema.parse(response)
    } catch (err) {
      return handleError({ set } as any, err)
    }
  })
  .get('/details/:id', async ({ params, set }) => {
    try {
      const projectId = params.id

      const { data, error } = await supabase
        .from('projects')
        .select(`
          project_id,
          title,
          content,
          badge,
          preview_image_url,
          short_description,
          status,
          like_count,
          view_count,
          created_at,
          updated_at,
          project_categories:project_categories(
            category:categories(
              category_id,
              category_name
            )
          ),
          project_external_links(
            link_url
          ),
          project_files(
            file_id,
            file_url
          )
        `)
        .eq('project_id', projectId)
        .maybeSingle()

      if (error) throw error
      if (!data) throw AppError.notFound('Project not found')

      const response = {
        projectId: data.project_id,
        title: data.title,
        badge: data.badge,
        status: data.status,
        previewImageUrl: data.preview_image_url ?? null,
        shortDescription: data.short_description ?? null,
        content: data.content ?? null,
        categories: (data.project_categories ?? [])
          .map((pc: any) => pc?.category)
          .filter(Boolean)
          .map((c: any) => ({
            categoryId: c.category_id,
            categoryName: c.category_name
          })),
        externalLinks: (data.project_external_links ?? []).map((l: any) => l.link_url),
        files: (data.project_files ?? []).map((f: any) => ({
          fileId: f.file_id,
          fileUrl: f.file_url
        })),
        likeCount: data.like_count ?? 0,
        viewCount: data.view_count ?? 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      //log some info
      console.log('Project details fetched successfully:', response)
      return ProjectDetailsResSchema.parse(response)
    } catch (err) {
      return handleError({ set } as any, err)
    }
  })
