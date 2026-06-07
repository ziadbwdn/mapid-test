import { Pool } from 'pg'
import analyticsRepository from '../repositories/analyticsRepository'
import productRepository from '../repositories/productRepository'
import type {
  EngineeredMetrics, BCGProduct, ProfitByCategory, HitlistItem, BoxplotGroup, BoxplotResponse
} from '../types'

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  if (upper >= sorted.length) return sorted[lower]
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function computeBoxplotStats(values: number[]): {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  whisker_min: number
  whisker_max: number
  fliers: number[]
} {
  const sorted = [...values].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const q1 = percentile(sorted, 0.25)
  const med = percentile(sorted, 0.5)
  const q3 = percentile(sorted, 0.75)
  const iqr = q3 - q1
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr

  const whiskerMin = Math.min(...sorted.filter(v => v >= lowerFence))
  const whiskerMax = Math.max(...sorted.filter(v => v <= upperFence))
  const fliers = sorted.filter(v => v < whiskerMin || v > whiskerMax)

  return {
    min,
    q1,
    median: med,
    q3,
    max,
    whisker_min: whiskerMin,
    whisker_max: whiskerMax,
    fliers,
  }
}

function getBoxplotData(products: Record<string, unknown>[]): BoxplotResponse {
  const withMetrics = products.map(p => {
    const m = computeEngineeredMetrics(p)
    return { ...p, ...m } as Record<string, unknown>
  })

  const categories = ['Accessories', 'Bikes', 'Clothing']
  const tiers = [
    { label: 'Low Cost (<$100)', max: 100, color: '#66c2a5' },
    { label: 'Mid Cost ($100-$800)', min: 100, max: 800, color: '#fc8d62' },
    { label: 'High Cost (>$800)', min: 800, color: '#8da0cb' },
  ]

  const groups: BoxplotGroup[] = []

  for (const category of categories) {
    for (const tier of tiers) {
      const groupProducts = withMetrics.filter(p => {
        if (String(p.category) !== category) return false
        const cost = Number(p.cost) || 0
        if (tier.max !== undefined && tier.min !== undefined) {
          return cost >= tier.min && cost <= tier.max
        }
        if (tier.max !== undefined) return cost < tier.max
        if (tier.min !== undefined) return cost > tier.min
        return false
      })

      if (groupProducts.length === 0) continue

      const profits = groupProducts.map(p => Number(p.total_profit))
      const stats = computeBoxplotStats(profits)

      const flierProducts = groupProducts.filter(
        p => {
          const tp = Number(p.total_profit)
          return tp < stats.whisker_min || tp > stats.whisker_max
        }
      )

      groups.push({
        category,
        cost_tier: tier.label,
        tier_color: tier.color,
        min: stats.min,
        q1: stats.q1,
        median: stats.median,
        q3: stats.q3,
        max: stats.max,
        whisker_min: stats.whisker_min,
        whisker_max: stats.whisker_max,
        fliers: flierProducts.map(p => ({
          product_name: String(p.product_name),
          total_profit: Number(p.total_profit),
        })),
      })
    }
  }

  const bottom_10 = withMetrics
    .sort((a, b) => Number(a.total_profit) - Number(b.total_profit))
    .slice(0, 10)
    .map(p => ({
      product_name: String(p.product_name),
      total_profit: Number(p.total_profit),
    }))

  return { groups, bottom_10 }
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

  const medianVolume = median(withMetrics.map(p => Number(p.total_quantity)))
  const medianMargin = median(withMetrics.map(p => Number(p.profit_margin_pct)))

  return withMetrics.map(p => {
    const totalQty = Number(p.total_quantity)
    const margin = Number(p.profit_margin_pct)
    return {
      product_id: String(p.id),
      product_name: String(p.product_name),
      category: String(p.category),
      segment: String(p.segment),
      sales_velocity: Number(p.sales_velocity),
      profit_margin_pct: margin,
      total_profit: Number(p.total_profit),
      profit_per_unit: Number(p.profit_per_unit),
      total_quantity: totalQty,
      quadrant: (totalQty >= medianVolume && margin >= medianMargin
        ? 'Star'
        : totalQty >= medianVolume && margin < medianMargin
          ? 'Workhorse'
          : totalQty < medianVolume && margin >= medianMargin
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

  async function getBoxplotDataSvc(): Promise<BoxplotResponse> {
    const products = await productRepo.getAllProducts()
    return getBoxplotData(products)
  }

  return {
    computeEngineeredMetrics,
    getCategoryDistribution,
    getSegmentDistribution,
    getCostDistribution,
    getHealthReport,
    getHealthQuadrant,
    getProfitByCategory,
    getMaintenanceHitlist: getMaintenanceHitlistSvc,
    getBoxplotData: getBoxplotDataSvc,
  }
}

export default analyticsService
