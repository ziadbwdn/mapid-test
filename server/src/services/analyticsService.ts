import { Pool } from 'pg'
import analyticsRepository from '../repositories/analyticsRepository'
import productRepository from '../repositories/productRepository'
import type {
  EngineeredMetrics, BCGProduct, ProfitByCategory, HitlistItem
} from '../types'

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

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

function classifyBCG(products: Record<string, unknown>[]): BCGProduct[] {
  const withMetrics = products.map(p => {
    const m = computeEngineeredMetrics(p)
    return { ...p, ...m } as Record<string, unknown>
  })

  const medianVolume = median(withMetrics.map(p => Number(p.sales_velocity)))
  const medianMargin = median(withMetrics.map(p => Number(p.profit_margin_pct)))

  return withMetrics.map(p => {
    const velocity = Number(p.sales_velocity)
    const margin = Number(p.profit_margin_pct)
    return {
      product_id: String(p.id),
      product_name: String(p.product_name),
      category: String(p.category),
      segment: String(p.segment),
      sales_velocity: velocity,
      profit_margin_pct: margin,
      total_profit: Number(p.total_profit),
      profit_per_unit: Number(p.profit_per_unit),
      quadrant: (velocity >= medianVolume && margin >= medianMargin
        ? 'Star'
        : velocity >= medianVolume && margin < medianMargin
          ? 'Workhorse'
          : velocity < medianVolume && margin >= medianMargin
            ? 'Niche'
            : 'Dog') as BCGProduct['quadrant']
    }
  })
}

function aggregateProfitByCategory(products: Record<string, unknown>[]): ProfitByCategory[] {
  const withMetrics = products.map(p => {
    const m = computeEngineeredMetrics(p)
    return { ...p, ...m } as Record<string, unknown>
  })

  const map = new Map<string, ProfitByCategory>()
  for (const p of withMetrics) {
    const cat = String(p.category)
    const existing = map.get(cat) || { category_name: cat, total_profit: 0, product_count: 0 }
    existing.total_profit += Number(p.total_profit)
    existing.product_count += 1
    map.set(cat, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.total_profit - a.total_profit)
}

function getMaintenanceHitlist(products: Record<string, unknown>[]): HitlistItem[] {
  const withMetrics = products.map(p => {
    const m = computeEngineeredMetrics(p)
    return { ...p, ...m } as Record<string, unknown>
  })

  return withMetrics
    .sort((a, b) => Number(a.total_profit) - Number(b.total_profit))
    .slice(0, 10)
    .map(p => ({
      product_name: String(p.product_name),
      category: String(p.category),
      total_profit: Number(p.total_profit),
      profit_margin_pct: Number(p.profit_margin_pct)
    }))
}

function analyticsService(pool: Pool) {
  const analyticsRepo = analyticsRepository(pool)
  const productRepo = productRepository(pool)

  async function getCategoryDistribution(): Promise<Record<string, unknown>[]> {
    return analyticsRepo.getCategoryDistribution() as unknown as Record<string, unknown>[]
  }

  async function getSegmentDistribution(): Promise<Record<string, unknown>[]> {
    return analyticsRepo.getSegmentDistribution() as unknown as Record<string, unknown>[]
  }

  async function getCostDistribution(): Promise<Record<string, unknown>[]> {
    return analyticsRepo.getCostDistribution() as unknown as Record<string, unknown>[]
  }

  async function getHealthReport(): Promise<Record<string, unknown>[]> {
    return analyticsRepo.getHealthReport()
  }

  async function getHealthQuadrant(): Promise<BCGProduct[]> {
    const products = await productRepo.getAllProducts()
    return classifyBCG(products)
  }

  async function getProfitByCategory(): Promise<ProfitByCategory[]> {
    const products = await productRepo.getAllProducts()
    return aggregateProfitByCategory(products)
  }

  async function getMaintenanceHitlistSvc(): Promise<HitlistItem[]> {
    const products = await productRepo.getAllProducts()
    return getMaintenanceHitlist(products)
  }

  return {
    computeEngineeredMetrics,
    getCategoryDistribution,
    getSegmentDistribution,
    getCostDistribution,
    getHealthReport,
    getHealthQuadrant,
    getProfitByCategory,
    getMaintenanceHitlist: getMaintenanceHitlistSvc
  }
}

export default analyticsService
