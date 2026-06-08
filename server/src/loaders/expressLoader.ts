import express, { Express } from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import config from '../config'
import requestLogger from '../middleware/requestLogger'
import errorHandler from '../middleware/errorHandler'
import notFound from '../middleware/notFound'
import routes from '../routes'

function expressLoader({ app, pool }: { app: Express; pool: Pool }): void {
  app.use(cors({ origin: config.cors.origin, methods: ['GET', 'POST'] }))
  app.use(express.json())
  app.use(requestLogger)

  app.use('/api', routes(pool))

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      name: 'webgis-store',
      version: '1.0.0',
      endpoints: {
        map: '/api/map',
        kpi: '/api/kpi',
        analytics: '/api/analytics',
        products: '/api/products',
        import: '/api/import'
      }
    })
  })

  app.use(notFound)
  app.use(errorHandler)
}

export default expressLoader
