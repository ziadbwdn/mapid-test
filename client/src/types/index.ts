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
  properties: {
    id: string
    product_key: number
    product_name: string
    category: string
    segment: string
    health_status: string
    health_score: number
    total_revenue: number
    color: string
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
