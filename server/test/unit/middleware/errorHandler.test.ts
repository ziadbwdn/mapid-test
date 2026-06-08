import { describe, it, expect, vi } from 'vitest'
import errorHandler from '../../../src/middleware/errorHandler'
import AppError from '../../../src/utils/AppError'

vi.mock('../../../src/utils/logger', () => ({
  default: {
    error: vi.fn()
  }
}))

describe('errorHandler', () => {
  it('handles AppError with operational status', () => {
    const err = new AppError(400, 'VALIDATION_ERROR', 'Input tidak valid')
    const req = { method: 'GET', originalUrl: '/api/test' } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any
    const next = vi.fn()

    errorHandler(err, req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Input tidak valid' }
    })
  })

  it('handles generic Error with 500', () => {
    const err = new Error('Something broke')
    const req = { method: 'POST', originalUrl: '/api/data' } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any
    const next = vi.fn()

    errorHandler(err, req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }
    })
  })

  it('uses default message for non-operational AppError', () => {
    const err = new AppError(500, 'DB_ERROR', 'Database connection failed')
    err.isOperational = false
    const req = { method: 'GET', originalUrl: '/api' } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as any
    const next = vi.fn()

    errorHandler(err, req, res, next)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'DB_ERROR', message: 'Terjadi kesalahan server' }
    })
  })
})
