import { Router } from 'express'
import { Pool } from 'pg'
import mapHandler from '../handlers/mapHandler'
import mapService from '../services/mapService'

function mapRoutes(pool: Pool): Router {
  const router = Router()
  const mapSvc = mapService(pool)
  const handler = mapHandler(mapSvc)

  router.get('/geojson', handler.getGeoJSON)

  return router
}

export default mapRoutes
