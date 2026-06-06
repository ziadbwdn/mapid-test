import { Router } from 'express'
import { Pool } from 'pg'
import analyticsHandler from '../handlers/analyticsHandler'
import analyticsService from '../services/analyticsService'

function analyticsRoutes(pool: Pool): Router {
  const router = Router()
  const analyticsSvc = analyticsService(pool)
  const handler = analyticsHandler(analyticsSvc)

  router.get('/category', handler.getCategoryDistribution)
  router.get('/segment', handler.getSegmentDistribution)
  router.get('/cost-distribution', handler.getCostDistribution)
  router.get('/health', handler.getHealthReport)
  router.get('/health-quadrant', handler.getHealthQuadrant)
  router.get('/profit-by-category', handler.getProfitByCategory)
  router.get('/maintenance-hitlist', handler.getMaintenanceHitlist)

  return router
}

export default analyticsRoutes
