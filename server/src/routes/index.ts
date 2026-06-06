import { Router } from 'express'
import { Pool } from 'pg'
import mapRoutes from './mapRoutes'
import kpiRoutes from './kpiRoutes'
import analyticsRoutes from './analyticsRoutes'
import productRoutes from './productRoutes'
import importRoutes from './importRoutes'

function routes(pool: Pool): Router {
  const router = Router()

  router.use('/map', mapRoutes(pool))
  router.use('/kpi', kpiRoutes(pool))
  router.use('/analytics', analyticsRoutes(pool))
  router.use('/products', productRoutes(pool))
  router.use('/import', importRoutes(pool))

  return router
}

export default routes
