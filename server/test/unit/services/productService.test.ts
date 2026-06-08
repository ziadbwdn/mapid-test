import { describe, it, expect, vi, afterEach } from 'vitest'
import productService from '../../../src/services/productService'
import productRepository from '../../../src/repositories/productRepository'

vi.mock('../../../src/repositories/productRepository', () => ({
  default: vi.fn()
}))

describe('productService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('computes engineered metrics for each product', async () => {
    const mockRepo = {
      getPaginated: vi.fn().mockResolvedValue({
        data: [
          { id: '1', product_name: 'Bike A', avg_selling_price: 1000, cost: 400, total_quantity: 50, time_span: 200 },
          { id: '2', product_name: 'Helmet B', avg_selling_price: 100, cost: 30, total_quantity: 200, time_span: 100 }
        ],
        total: 2
      })
    }
    ;(productRepository as any).mockReturnValue(mockRepo)

    const svc = productService({} as any)
    const result = await svc.getPaginatedProducts({ page: 1, limit: 10 })

    expect(result.total).toBe(2)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toMatchObject({
      profit_per_unit: 600,
      total_profit: 30000,
      profit_margin_pct: 60,
      sales_velocity: 0.25
    })
    expect(result.data[1]).toMatchObject({
      profit_per_unit: 70,
      total_profit: 14000,
      profit_margin_pct: 70,
      sales_velocity: 2
    })
  })

  it('returns empty array when no products', async () => {
    const mockRepo = {
      getPaginated: vi.fn().mockResolvedValue({ data: [], total: 0 })
    }
    ;(productRepository as any).mockReturnValue(mockRepo)

    const svc = productService({} as any)
    const result = await svc.getPaginatedProducts({ page: 1, limit: 10 })
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })

  it('handles zero values gracefully', async () => {
    const mockRepo = {
      getPaginated: vi.fn().mockResolvedValue({
        data: [{ id: '3', product_name: 'Zero Product', avg_selling_price: 0, cost: 0, total_quantity: 0, time_span: 0 }],
        total: 1
      })
    }
    ;(productRepository as any).mockReturnValue(mockRepo)

    const svc = productService({} as any)
    const result = await svc.getPaginatedProducts({ page: 1, limit: 10 })
    expect(result.data[0]).toMatchObject({
      profit_per_unit: 0,
      total_profit: 0,
      profit_margin_pct: 0,
      sales_velocity: 0
    })
  })
})
