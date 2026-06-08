import { describe, it, expect, vi } from 'vitest'
import express from 'express'
import routes from '../../src/routes'
import notFound from '../../src/middleware/notFound'
import errorHandler from '../../src/middleware/errorHandler'

function createTestApp() {
  const app = express()
  const mockQuery = vi.fn()

  const mockPool = {
    query: mockQuery,
    connect: vi.fn().mockResolvedValue({
      query: mockQuery,
      release: vi.fn()
    })
  } as any

  app.use(express.json())
  app.use('/api', routes(mockPool))
  app.use(notFound)
  app.use(errorHandler)

  return { app, mockQuery, mockPool }
}

describe('API Integration', () => {
  describe('GET /api/kpi', () => {
    it('returns KPI data', async () => {
      const { app, mockQuery } = createTestApp()
      const kpiRow = {
        total_products: 100, total_revenue: '50000', total_orders: 1000,
        total_quantity_sold: 5000, total_customers: 300,
        avg_product_cost: 150, avg_monthly_revenue: 4000,
        healthy_products: 60, at_risk_products: 25, critical_products: 15,
        earliest_sale_date: '2023-01-01', latest_sale_date: '2024-06-01'
      }
      mockQuery.mockResolvedValue({ rows: [kpiRow] })

      const res = await (await import('supertest')).default(app).get('/api/kpi')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.total_products).toBe(100)
    })

    it('returns null when no KPI data', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [] })

      const res = await (await import('supertest')).default(app).get('/api/kpi')
      expect(res.status).toBe(200)
      expect(res.body.data).toBeNull()
    })
  })

  describe('GET /api/map/geojson', () => {
    it('returns GeoJSON', async () => {
      const { app, mockQuery } = createTestApp()
      const geojson = { type: 'FeatureCollection', features: [] }
      mockQuery.mockResolvedValue({ rows: [{ geojson }] })

      const res = await (await import('supertest')).default(app).get('/api/map/geojson')
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ success: true, data: geojson })
    })

    it('passes query filters', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [{ geojson: { type: 'FeatureCollection', features: [] } }] })

      await (await import('supertest')).default(app).get('/api/map/geojson?category=Bikes&segment=High-Performer')
      expect(mockQuery).toHaveBeenCalled()
      const call = mockQuery.mock.calls[0]
      expect(call[1]).toContain('Bikes')
    })
  })

  describe('GET /api/map/radius-search', () => {
    it('returns 400 when lng is missing', async () => {
      const { app } = createTestApp()
      const res = await (await import('supertest')).default(app).get('/api/map/radius-search?lat=-6.2')
      expect(res.status).toBe(400)
    })

    it('returns results with valid params', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [{ product_id: '1', product_name: 'Bike' }] })

      const res = await (await import('supertest')).default(app).get('/api/map/radius-search?lng=106.8&lat=-6.2&radius=50000')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/analytics/*', () => {
    it('returns category distribution', async () => {
      const { app, mockQuery } = createTestApp()
      const rows = [{ dimension_value: 'Bikes', product_count: 10, total_revenue: 5000, color_code: '#10b981' }]
      mockQuery.mockResolvedValue({ rows })

      const res = await (await import('supertest')).default(app).get('/api/analytics/category')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toEqual(rows)
    })

    it('returns segment distribution', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [] })

      const res = await (await import('supertest')).default(app).get('/api/analytics/segment')
      expect(res.status).toBe(200)
    })

    it('returns cost distribution', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [] })

      const res = await (await import('supertest')).default(app).get('/api/analytics/cost-distribution')
      expect(res.status).toBe(200)
    })

    it('returns health report', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [] })

      const res = await (await import('supertest')).default(app).get('/api/analytics/health')
      expect(res.status).toBe(200)
    })

    it('returns maintenance hitlist', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockResolvedValue({ rows: [] })

      const res = await (await import('supertest')).default(app).get('/api/analytics/maintenance-hitlist')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/products', () => {
    it('returns paginated products', async () => {
      const { app, mockQuery } = createTestApp()
      const countRow = { total: '15' }
      const dataRows = [
        { id: '1', product_name: 'Bike A', category: 'Bikes' },
        { id: '2', product_name: 'Bike B', category: 'Bikes' }
      ]

      mockQuery
        .mockResolvedValueOnce({ rows: [countRow] })
        .mockResolvedValueOnce({ rows: dataRows })

      const res = await (await import('supertest')).default(app).get('/api/products?page=1&limit=2')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.meta.total).toBe(15)
      expect(res.body.meta.total_pages).toBe(8)
    })
  })

  describe('POST /api/import', () => {
    it('returns 500 when GeoJSON API fails', async () => {
      const { app, mockQuery } = createTestApp()
      mockQuery.mockRejectedValue(new Error('DB error'))

      const res = await (await import('supertest')).default(app).post('/api/import')
      expect(res.status).toBe(500)
    })
  })

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const { app } = createTestApp()
      const res = await (await import('supertest')).default(app).get('/api/unknown-route')
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })
  })
})
