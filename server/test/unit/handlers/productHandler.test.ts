import { describe, it, expect, vi } from 'vitest'
import productHandler from '../../../src/handlers/productHandler'

describe('productHandler', () => {
  it('uses default page=1 and limit=10 when not provided', async () => {
    const productSvc = {
      getPaginatedProducts: vi.fn().mockResolvedValue({ data: [], total: 0 })
    }
    const handler = productHandler(productSvc)
    const res = { json: vi.fn() } as any
    const req = { query: {} } as any

    await (handler.getProducts as any)(req, res)
    expect(productSvc.getPaginatedProducts).toHaveBeenCalledWith({
      page: 1, limit: 10, search: undefined, sort_by: undefined, sort_order: undefined
    })
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      meta: { page: 1, limit: 10, total: 0, total_pages: 0 }
    })
  })

  it('parses page, limit, search, sort from query', async () => {
    const productSvc = {
      getPaginatedProducts: vi.fn().mockResolvedValue({ data: [{ id: 1 }], total: 1 })
    }
    const handler = productHandler(productSvc)
    const res = { json: vi.fn() } as any
    const req = { query: { page: '2', limit: '5', search: 'bike', sort_by: 'cost', sort_order: 'desc' } } as any

    await (handler.getProducts as any)(req, res)
    expect(productSvc.getPaginatedProducts).toHaveBeenCalledWith({
      page: 2, limit: 5, search: 'bike', sort_by: 'cost', sort_order: 'desc'
    })
  })
})
