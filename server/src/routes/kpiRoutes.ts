import { Router } from 'express'
import { Pool } from 'pg'
import kpiHandler from '../handlers/kpiHandler'
import kpiService from '../services/kpiService'

function kpiRoutes(pool: Pool): Router {
  const router = Router()
  const kpiSvc = kpiService(pool)
  const handler = kpiHandler(kpiSvc)

  router.get('/', handler.getKPI)

  return router
}

export default kpiRoutes
