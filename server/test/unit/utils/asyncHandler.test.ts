import { describe, it, expect, vi } from 'vitest'
import asyncHandler from '../../../src/utils/asyncHandler'

describe('asyncHandler', () => {
  it('calls next with error when handler throws', async () => {
    const error = new Error('Async error')
    const handler = asyncHandler(async () => {
      throw error
    })
    const req = {} as any
    const res = {} as any
    const next = vi.fn()

    await handler(req, res, next)
    expect(next).toHaveBeenCalledWith(error)
  })

  it('does not call next when handler succeeds', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true })
    })
    const req = {} as any
    const res = { json: vi.fn() } as any
    const next = vi.fn()

    await handler(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })
})
