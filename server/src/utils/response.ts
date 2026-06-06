import { Response } from 'express'

interface Meta {
  page?: number
  limit?: number
  total?: number
  total_pages?: number
  [key: string]: unknown
}

export function sendSuccess(res: Response, data: unknown, meta: Meta | null = null): void {
  const body: Record<string, unknown> = { success: true, data }
  if (meta) body.meta = meta
  res.json(body)
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  page: number,
  limit: number,
  total: number
): void {
  sendSuccess(res, data, {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit)
  })
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message }
  })
}
