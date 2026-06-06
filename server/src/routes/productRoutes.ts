import { Router } from 'express'
import { Pool } from 'pg'
import productHandler from '../handlers/productHandler'
import productService from '../services/productService'

function productRoutes(pool: Pool): Router {
  const router = Router()
  const productSvc = productService(pool)
  const handler = productHandler(productSvc)

  router.get('/', handler.getProducts)

  return router
}

export default productRoutes
