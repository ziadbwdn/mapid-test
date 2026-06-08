import { describe, it, expect, vi } from 'vitest'
import { sendSuccess, sendPaginated, sendError } from '../../../src/utils/response'

function mockRes() {
  return {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis()
  } as any
}

describe('sendSuccess', () => {
  it('sends success response with data', () => {
    const res = mockRes()
    sendSuccess(res, { key: 'value' }, null)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { key: 'value' }
    })
  })

  it('includes meta when provided', () => {
    const res = mockRes()
    sendSuccess(res, [], { page: 1, limit: 10, total: 100, total_pages: 10 })
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      meta: { page: 1, limit: 10, total: 100, total_pages: 10 }
    })
  })

  it('sends null data', () => {
    const res = mockRes()
    sendSuccess(res, null)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null
    })
  })
})

describe('sendPaginated', () => {
  it('sends paginated response with computed total_pages', () => {
    const res = mockRes()
    const data = [{ id: 1 }, { id: 2 }]
    sendPaginated(res, data, 1, 10, 25)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
      meta: {
        page: 1,
        limit: 10,
        total: 25,
        total_pages: 3
      }
    })
  })

  it('computes total_pages = 1 when total <= limit', () => {
    const res = mockRes()
    sendPaginated(res, [], 1, 10, 5)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ total_pages: 1 })
      })
    )
  })
})

describe('sendError', () => {
  it('sends error response with status code', () => {
    const res = mockRes()
    sendError(res, 404, 'NOT_FOUND', 'Not found')
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Not found' }
    })
  })

  it('sends 500 internal error', () => {
    const res = mockRes()
    sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong')
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
    })
  })
})
