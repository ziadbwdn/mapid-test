import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'

function mapHandler(mapSvc: { getGeoJSON: (filters: Record<string, string | undefined>) => Promise<Record<string, unknown>> }) {
  return {
    getGeoJSON: asyncHandler(async (req: Request, res: Response) => {
      const { category, segment, search } = req.query as Record<string, string | undefined>
      const geojson = await mapSvc.getGeoJSON({ category, segment, search })
      res.json(geojson)
    })
  }
}

export default mapHandler
