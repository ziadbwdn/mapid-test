import { Router } from 'express'
import { Pool } from 'pg'
import importHandler from '../handlers/importHandler'
import importService from '../services/importService'

function importRoutes(pool: Pool): Router {
  const router = Router()
  const importSvc = importService(pool)
  const handler = importHandler(importSvc)

  router.post('/', handler.runImport)

  return router
}

export default importRoutes
