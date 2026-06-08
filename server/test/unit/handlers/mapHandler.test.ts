import { describe, it, expect, vi } from 'vitest'
import mapHandler from '../../../src/handlers/mapHandler'

describe('mapHandler', () => {
  const mockGeoJSON = { type: 'FeatureCollection', features: [] }

  const mapSvc = {
    getGeoJSON: vi.fn().mockResolvedValue(mockGeoJSON),
    getRadiusSearch: vi.fn().mockResolvedValue([])
  }

  it('getGeoJSON returns GeoJSON on success', async () => {
    const handler = mapHandler(mapSvc)
    const res = { json: vi.fn() } as any
    const req = { query: {} } as any

    await (handler.getGeoJSON as any)(req, res)
    expect(mapSvc.getGeoJSON).toHaveBeenCalledWith({ category: undefined, segment: undefined, search: undefined })
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockGeoJSON })
  })

  it('getGeoJSON passes query filters', async () => {
    const handler = mapHandler(mapSvc)
    const res = { json: vi.fn() } as any
    const req = { query: { category: 'Bikes', segment: 'High-Performer' } } as any

    await (handler.getGeoJSON as any)(req, res)
    expect(mapSvc.getGeoJSON).toHaveBeenCalledWith({ category: 'Bikes', segment: 'High-Performer', search: undefined })
  })

  it('getRadiusSearch returns 400 when lng is missing', async () => {
    const handler = mapHandler(mapSvc)
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any
    const req = { query: { lat: '-6.2' } } as any

    await (handler.getRadiusSearch as any)(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'lng and lat query params are required and must be numeric'
    })
  })

  it('getRadiusSearch returns 400 when lat is non-numeric', async () => {
    const handler = mapHandler(mapSvc)
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any
    const req = { query: { lng: '106.8', lat: 'invalid' } } as any

    await (handler.getRadiusSearch as any)(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getRadiusSearch returns 400 when lng is NaN', async () => {
    const handler = mapHandler(mapSvc)
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any
    const req = { query: { lng: 'abc', lat: '-6.2' } } as any

    await (handler.getRadiusSearch as any)(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('getRadiusSearch calls service with valid params', async () => {
    const handler = mapHandler(mapSvc)
    const res = { json: vi.fn() } as any
    const req = { query: { lng: '106.8', lat: '-6.2', radius: '50000' } } as any

    await (handler.getRadiusSearch as any)(req, res)
    expect(mapSvc.getRadiusSearch).toHaveBeenCalledWith(106.8, -6.2, 50000)
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
  })
})
