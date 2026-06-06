import { Pool } from 'pg'
import productRepository from '../repositories/productRepository'
import type { PaginateOpts, PaginatedResult, EngineeredMetrics } from '../types'

function computeEngineeredMetrics(product: Record<string, unknown>): EngineeredMetrics {
  const asp = Number(product.avg_selling_price) || 0
  const cost = Number(product.cost) || 0
  const qty = Number(product.total_quantity) || 0
  const span = Number(product.time_span) || 0

  const profit_per_unit = parseFloat((asp - cost).toFixed(2))
  const total_profit = parseFloat((qty * profit_per_unit).toFixed(2))
  const profit_margin_pct = asp > 0
    ? parseFloat(((profit_per_unit / asp) * 100).toFixed(2))
    : 0
  const sales_velocity = span > 0
    ? parseFloat((qty / span).toFixed(2))
    : 0

  return { profit_per_unit, total_profit, profit_margin_pct, sales_velocity }
}

function productService(pool: Pool) {
  const productRepo = productRepository(pool)

  async function getPaginatedProducts(opts: PaginateOpts): Promise<PaginatedResult> {
    const result = await productRepo.getPaginated(opts)

    const dataWithMetrics = result.data.map(p => ({
      ...p,
      ...computeEngineeredMetrics(p)
    }))

    return { data: dataWithMetrics, total: result.total }
  }

  return { getPaginatedProducts }
}

export default productService
