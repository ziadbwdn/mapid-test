import { describe, it, expect, vi } from 'vitest'
import kpiHandler from '../../../src/handlers/kpiHandler'

describe('kpiHandler', () => {
  it('returns KPI data via sendSuccess', async () => {
    const mockKPI = { total_products: 100, total_revenue: 50000 }
    const kpiSvc = { getKPI: vi.fn().mockResolvedValue(mockKPI) }
    const handler = kpiHandler(kpiSvc)

    const res = { json: vi.fn() } as any
    const req = {} as any

    await (handler.getKPI as any)(req, res)
    expect(kpiSvc.getKPI).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockKPI
    })
  })

  it('returns null KPI data', async () => {
    const kpiSvc = { getKPI: vi.fn().mockResolvedValue(null) }
    const handler = kpiHandler(kpiSvc)

    const res = { json: vi.fn() } as any
    const req = {} as any

    await (handler.getKPI as any)(req, res)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null
    })
  })
})
