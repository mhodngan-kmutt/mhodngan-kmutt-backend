// src/routes/project.routes.ts

import Elysia, { t } from 'elysia'
import { supabase } from '../lib/supabase'
import { handleError, AppError } from '../utils/errors'
import { ProjectDetailsReqSchema, ProjectDetailsResSchema } from '../models/project'
import { csv, type IncludeKey } from '../utils/project.query'
import { getProjectById, listProjects } from '../services/project.service'

export const projectRoutes = new Elysia({ prefix: '/project' })

  // GET /project/list
  .get(
    '/list',
    async ({ query, set }) => {
      try {
        const include = csv(query.include as string | undefined) as IncludeKey[]
        const statusList = csv(query.status as string | undefined)

        const res = await listProjects(supabase, {
          q: query.q as string | undefined,
          badge: query.badge as string | undefined,
          statusList,
          from: query.from as string | undefined,
          to: query.to as string | undefined,
          contributors: csv(query.contributors as string | undefined),
          orderBy: (query.orderBy as string | undefined) ?? 'updated_at',
          order: (query.order as 'asc' | 'desc' | undefined) ?? 'desc',
          page: Math.max(1, Number(query.page ?? 1)),
          pageSize: Math.min(100, Math.max(1, Number(query.pageSize ?? 20))),
          include: include.length ? include : ['categories', 'links', 'files']
        })
        // log data
        console.log(res)
        return res
      } catch (err) {
        return handleError({ set } as any, err)
      }
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        badge: t.Optional(t.String()),
        status: t.Optional(t.String()),          // CSV
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
        contributors: t.Optional(t.String()),    // CSV user_id
        orderBy: t.Optional(
          t.Union([
            t.Literal('created_at'),
            t.Literal('updated_at'),
            t.Literal('title'),
            t.Literal('like_count'),
            t.Literal('view_count')
          ])
        ),
        order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
        page: t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
        include: t.Optional(t.String())          // CSV: categories,links,files
      })
    }
  )

  // POST /project/details
  .post('/details', async ({ body, set }) => {
    try {
      const { projectId } = ProjectDetailsReqSchema.parse(body)
      const project = await getProjectById(supabase, projectId, ['categories', 'links', 'files'])
      if (!project) throw AppError.notFound('Project not found')
      return ProjectDetailsResSchema.parse(project)
    } catch (err) {
      return handleError({ set } as any, err)
    }
  })

  // GET /project/details/:id
  .get('/details/:id', async ({ params, set }) => {
    try {
      const project = await getProjectById(supabase, params.id, ['categories', 'links', 'files'])
      if (!project) throw AppError.notFound('Project not found')
      // log data
      console.log(project)
      return ProjectDetailsResSchema.parse(project)
    } catch (err) {
      return handleError({ set } as any, err)
    }
  })
