import type { Context } from 'elysia'
import type { ZodError } from 'zod'

/** Consistent error codes for clients / UI */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'SUPABASE_ERROR'
  | 'INTERNAL_SERVER_ERROR'

/** AppError with HTTP status + optional code/details */
export class AppError extends Error {
  status: number
  code: ErrorCode
  details?: unknown

  constructor(
    status: number,
    message: string,
    options?: { code?: ErrorCode; details?: unknown }
  ) {
    super(message)
    this.status = status
    this.code = options?.code ?? mapStatusToCode(status)
    this.details = options?.details
  }

  // Factory helpers
  static badRequest(msg = 'Bad request', details?: unknown) {
    return new AppError(400, msg, { code: 'BAD_REQUEST', details })
  }
  static unauthorized(msg = 'Unauthorized', details?: unknown) {
    return new AppError(401, msg, { code: 'UNAUTHORIZED', details })
  }
  static forbidden(msg = 'Forbidden', details?: unknown) {
    return new AppError(403, msg, { code: 'FORBIDDEN', details })
  }
  static notFound(msg = 'Not found', details?: unknown) {
    return new AppError(404, msg, { code: 'NOT_FOUND', details })
  }
  static conflict(msg = 'Conflict', details?: unknown) {
    return new AppError(409, msg, { code: 'CONFLICT', details })
  }
  static internal(msg = 'Internal Server Error', details?: unknown) {
    return new AppError(500, msg, { code: 'INTERNAL_SERVER_ERROR', details })
  }
}

/** Centralized handler you can call from any catch {} */
export function handleError(
  ctx: Context,
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
) {
  // Log for server debugging
  console.error('Error:', error)

  // AppError
  if (error instanceof AppError) {
    ctx.set.status = error.status
    return {
      error: error.message,
      code: error.code,
      details: error.details ?? undefined,
    }
  }

  // Zod validation errors
  if (isZodError(error)) {
    ctx.set.status = 400
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.issues,
    }
  }

  // Supabase errors (Postgrest / Auth)
  if (isSupabaseError(error)) {
    ctx.set.status = 500
    return {
      error: 'Database error',
      code: 'SUPABASE_ERROR',
      details: {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code,
      },
    }
  }

  // Default
  ctx.set.status = 500
  return {
    error: fallbackMessage,
    code: 'INTERNAL_SERVER_ERROR',
  }
}

/* ----------------- helpers ----------------- */

function mapStatusToCode(status: number): ErrorCode {
  if (status === 400) return 'BAD_REQUEST'
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status >= 500) return 'INTERNAL_SERVER_ERROR'
  return 'BAD_REQUEST'
}

function isZodError(err: unknown): err is ZodError {
  return !!err && typeof err === 'object' && 'issues' in (err as any)
}

/** Narrower check for common Supabase error shape */
function isSupabaseError(err: unknown): err is {
  message: string
  details?: string
  hint?: string
  code?: string
} {
  return !!err && typeof err === 'object' && 'message' in (err as any)
}
