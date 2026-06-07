export interface GeoJSONFilters {
  category?: string
  segment?: string
  search?: string
}

export interface PaginateOpts {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: string
}

export interface GeoJSONQuery {
  sql: string
  params: string[]
}

export interface PaginatedQuery {
  countSql: string
  dataSql: string
  countParams: string[]
  dataParams: string[]
}

export interface PaginatedResult {
  data: Record<string, unknown>[]
  total: number
}

export interface LookupTables {
  categoryMap: Map<string, string>
  subCategoryMap: Map<string, string>
  segmentMap: Map<string, string>
}

export interface KPIResult {
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
  earliest_sale_date: string
  latest_sale_date: string
}

export interface DimensionRow {
  dimension_value: string
  product_count: number
  total_revenue: number
  color_code: string
}

export interface CostDistRow {
  cost_range: string
  product_count: number
  avg_cost: number
}

export interface ProductRow {
  product_key: number
  product_name: string
  geojson_feature_id: string | null
  category_id: string
  sub_category_id: string
  segment_id: string
  cost: number
  avg_selling_price: number
  avg_order_revenue: number
  avg_monthly_revenue: number
  total_orders: number
  total_revenue: number
  total_quantity: number
  total_customers: number
  last_sale_date: string | null
  recency: number
  time_span: number
  longitude: number
  latitude: number
}

export interface SnapshotRow {
  product_id: string
  snapshot_date: string
  total_orders: number
  total_revenue: number
  total_quantity: number
  total_customers: number
  recency: number | null
  avg_monthly_revenue: number | null
  health_score: number | null
  health_status: string | null
}

export interface UpsertResult {
  imported: number
  updated: number
}

export interface EngineeredMetrics {
  profit_per_unit: number
  total_profit: number
  profit_margin_pct: number
  sales_velocity: number
}

export interface BCGProduct {
  product_id: string
  product_name: string
  category: string
  segment: string
  sales_velocity: number
  profit_margin_pct: number
  total_profit: number
  profit_per_unit: number
  total_quantity: number
  quadrant: 'Star' | 'Workhorse' | 'Niche' | 'Dog'
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
