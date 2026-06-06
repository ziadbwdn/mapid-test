import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { sendPaginated } from '../utils/response'

interface ProductService {
  getPaginatedProducts: (opts: {
    page: number
    limit: number
    search?: string
    sort_by?: string
    sort_order?: string
  }) => Promise<{ data: unknown[]; total: number }>
}

function productHandler(productSvc: ProductService) {
  return {
    getProducts: asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(String(req.query.page), 10) || 1
      const limit = parseInt(String(req.query.limit), 10) || 10
      const { search, sort_by, sort_order } = req.query as Record<string, string | undefined>

      const result = await productSvc.getPaginatedProducts({
        page, limit, search, sort_by, sort_order
      })

      sendPaginated(res, result.data, page, limit, result.total)
    })
  }
}

export default productHandler
