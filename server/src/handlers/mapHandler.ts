import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'

function mapHandler(mapSvc: {
  getGeoJSON: (filters: Record<string, string | undefined>) => Promise<Record<string, unknown>>
  getRadiusSearch: (longitude: number, latitude: number, radiusMeters: number) => Promise<Record<string, unknown>[]>
}) {
  return {
    getGeoJSON: asyncHandler(async (req: Request, res: Response) => {
      const { category, segment, search } = req.query as Record<string, string | undefined>
      const geojson = await mapSvc.getGeoJSON({ category, segment, search })
      sendSuccess(res, geojson)
    }),
    getRadiusSearch: asyncHandler(async (req: Request, res: Response) => {
      const lng = parseFloat(req.query.lng as string)
      const lat = parseFloat(req.query.lat as string)
      const radius = parseInt(req.query.radius as string, 10) || 50000
      if (Number.isNaN(lng) || Number.isNaN(lat)) {
        res.status(400).json({ error: 'lng and lat query params are required and must be numeric' })
        return
      }
      const results = await mapSvc.getRadiusSearch(lng, lat, radius)
      sendSuccess(res, results)
    })
  }
}

export default mapHandler
