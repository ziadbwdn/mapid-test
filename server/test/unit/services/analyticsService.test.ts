import { describe, it, expect } from 'vitest'
import analyticsService from '../../../src/services/analyticsService'

describe('analyticsService', () => {
  describe('computeEngineeredMetrics', () => {
    const svc = analyticsService({} as any)

    it('computes profit_per_unit as asp - cost', () => {
      const product = {
        avg_selling_price: 1200, cost: 500,
        total_quantity: 150, time_span: 365
      }
      const result = svc.computeEngineeredMetrics(product)
      expect(result.profit_per_unit).toBe(700.00)
      expect(result.total_profit).toBeCloseTo(105000, 0)
      expect(result.profit_margin_pct).toBeGreaterThan(0)
      expect(result.sales_velocity).toBeGreaterThan(0)
    })

    it('handles zero cost and zero price', () => {
      const result = svc.computeEngineeredMetrics({
        avg_selling_price: 0, cost: 0,
        total_quantity: 0, time_span: 0
      })
      expect(result.profit_per_unit).toBe(0)
      expect(result.total_profit).toBe(0)
      expect(result.profit_margin_pct).toBe(0)
      expect(result.sales_velocity).toBe(0)
    })

    it('handles negative profit (price < cost)', () => {
      const result = svc.computeEngineeredMetrics({
        avg_selling_price: 50, cost: 100,
        total_quantity: 10, time_span: 30
      })
      expect(result.profit_per_unit).toBe(-50)
      expect(result.total_profit).toBe(-500)
      expect(result.profit_margin_pct).toBeLessThan(0)
    })
  })
})
