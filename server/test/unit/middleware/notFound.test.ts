import { describe, it, expect, vi } from 'vitest'
import notFound from '../../../src/middleware/notFound'

describe('notFound', () => {
  it('calls next with AppError 404', () => {
    const req = { originalUrl: '/api/unknown' } as any
    const res = {} as any
    const next = vi.fn()

    notFound(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('/api/unknown')
  })
})
