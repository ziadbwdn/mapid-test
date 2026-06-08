import { describe, it, expect, vi } from 'vitest'
import analyticsHandler from '../../../src/handlers/analyticsHandler'

describe('analyticsHandler', () => {
  const mockData = [{ dimension_value: 'Bikes', product_count: 10 }]
  const analyticsSvc = {
    getCategoryDistribution: vi.fn().mockResolvedValue(mockData),
    getSegmentDistribution: vi.fn().mockResolvedValue(mockData),
    getCostDistribution: vi.fn().mockResolvedValue(mockData),
    getHealthReport: vi.fn().mockResolvedValue(mockData),
    getHealthQuadrant: vi.fn().mockResolvedValue(mockData),
    getProfitByCategory: vi.fn().mockResolvedValue(mockData),
    getMaintenanceHitlist: vi.fn().mockResolvedValue(mockData),
    getBoxplotData: vi.fn().mockResolvedValue(mockData)
  }

  const handler = analyticsHandler(analyticsSvc)
  const req = {} as any
  function makeRes() {
    return { json: vi.fn() } as any
  }

  it('getCategoryDistribution sends success', async () => {
    const res = makeRes()
    await (handler.getCategoryDistribution as any)(req, res)
    expect(analyticsSvc.getCategoryDistribution).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData })
  })

  it('getSegmentDistribution sends success', async () => {
    const res = makeRes()
    await (handler.getSegmentDistribution as any)(req, res)
    expect(analyticsSvc.getSegmentDistribution).toHaveBeenCalled()
  })

  it('getCostDistribution sends success', async () => {
    const res = makeRes()
    await (handler.getCostDistribution as any)(req, res)
    expect(analyticsSvc.getCostDistribution).toHaveBeenCalled()
  })

  it('getHealthReport sends success', async () => {
    const res = makeRes()
    await (handler.getHealthReport as any)(req, res)
    expect(analyticsSvc.getHealthReport).toHaveBeenCalled()
  })

  it('getHealthQuadrant sends success', async () => {
    const res = makeRes()
    await (handler.getHealthQuadrant as any)(req, res)
    expect(analyticsSvc.getHealthQuadrant).toHaveBeenCalled()
  })

  it('getProfitByCategory sends success', async () => {
    const res = makeRes()
    await (handler.getProfitByCategory as any)(req, res)
    expect(analyticsSvc.getProfitByCategory).toHaveBeenCalled()
  })

  it('getMaintenanceHitlist sends success', async () => {
    const res = makeRes()
    await (handler.getMaintenanceHitlist as any)(req, res)
    expect(analyticsSvc.getMaintenanceHitlist).toHaveBeenCalled()
  })

  it('getBoxplotData sends success', async () => {
    const res = makeRes()
    await (handler.getBoxplotData as any)(req, res)
    expect(analyticsSvc.getBoxplotData).toHaveBeenCalled()
  })
})
