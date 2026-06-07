export interface Product {
  id: string
  product_key: number
  product_name: string
  category: string
  category_color: string
  sub_category: string
  segment: string
  segment_color: string
  cost: number
  avg_selling_price: number
  avg_order_revenue: number
  avg_monthly_revenue: number
  total_orders: number
  total_revenue: number
  total_quantity: number
  total_customers: number
  last_sale_date: string
  recency: number
  time_span: number
  health_score: number
  health_status: string
  latitude: number
  longitude: number
  profit_per_unit?: number
  total_profit?: number
  profit_margin_pct?: number
  sales_velocity?: number
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: Record<string, unknown> & {
    id: string
    product_key: number
    product_name: string
    category: string
    color: string
    category_color?: string
    segment?: string
    segment_color?: string
    health_status?: string
    health_score?: number
    total_revenue?: number
    total_orders?: number
    total_quantity?: number
    cost?: number
    avg_selling_price?: number
    latitude?: number
    longitude?: number
    recency?: number
    time_span?: number
    sub_category?: string
  }
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface KPIData {
  total_products: number
  total_revenue: number
  total_orders: number
  total_quantity_sold: number
  total_customers: number
  avg_product_cost: number
  avg_monthly_revenue: number
  healthy_products: number
  at_risk_products: number
  critical_products: number
}

export interface CategoryData {
  dimension_value: string
  product_count: number
  total_revenue: number
  color_code: string
}

export interface SegmentData {
  dimension_value: string
  product_count: number
  total_revenue: number
  color_code: string
}

export interface CostDistribution {
  cost_range: string
  product_count: number
  avg_cost: number
}

export interface HealthQuadrant {
  product_id: string
  product_name: string
  sales_velocity: number
  profit_margin_pct: number
  total_profit: number
  total_quantity: number
  quadrant: string
}

export interface ProfitByCategory {
  category_name: string
  total_profit: number
  product_count: number
}

export interface HitlistItem {
  product_name: string
  category: string
  total_profit: number
  profit_margin_pct: number
}

export interface BoxplotOutlier {
  product_name: string
  total_profit: number
}

export interface BoxplotGroup {
  category: string
  cost_tier: string
  tier_color: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  whisker_min: number
  whisker_max: number
  fliers: BoxplotOutlier[]
}

export interface BoxplotResponse {
  groups: BoxplotGroup[]
  bottom_10: BoxplotOutlier[]
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta
  error?: {
    code: string
    message: string
  }
}
