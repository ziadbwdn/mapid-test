import type { GeoJSONFilters, PaginateOpts, GeoJSONQuery, PaginatedQuery } from '../types'

export function buildGeoJSONQuery(filters: GeoJSONFilters = {}): GeoJSONQuery {
  const conditions: string[] = []
  const params: string[] = []
  let idx = 1

  if (filters.category) {
    conditions.push(`category = $${idx++}`)
    params.push(filters.category)
  }
  if (filters.segment) {
    conditions.push(`segment = $${idx++}`)
    params.push(filters.segment)
  }
  if (filters.search) {
    conditions.push(`product_name ILIKE $${idx++}`)
    params.push(`%${filters.search}%`)
  }

  const whereClause = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : ''

  const sql = `
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(json_agg(feature), '[]'::json)
    ) AS geojson
    FROM (
      SELECT json_build_object(
        'type', 'Feature',
        'geometry', geojson_geometry,
        'properties', json_build_object(
          'id', id,
          'product_key', product_key,
          'product_name', product_name,
          'category', category,
          'category_color', category_color,
          'segment', segment,
          'segment_color', segment_color,
          'cost', cost,
          'avg_selling_price', avg_selling_price,
          'total_revenue', total_revenue,
          'total_orders', total_orders,
          'total_quantity', total_quantity,
          'health_score', health_score,
          'health_status', health_status,
          'latitude', latitude,
          'longitude', longitude,
          'recency', recency,
          'time_span', time_span
        )
      ) AS feature
      FROM vw_products_map
      ${whereClause}
      LIMIT 1000
    ) AS features
  `

  return { sql, params }
}

export function buildPaginatedProductQuery(opts: PaginateOpts = {}): PaginatedQuery {
  const allowedSortColumns = [
    'product_name', 'category', 'segment', 'cost',
    'avg_selling_price', 'total_revenue', 'total_orders',
    'total_quantity', 'health_score', 'recency', 'time_span'
  ]
  const sortCol = allowedSortColumns.includes(opts.sort_by || '') ? opts.sort_by! : 'product_name'
  const sortDir = opts.sort_order === 'desc' ? 'DESC' : 'ASC'
  const page = opts.page || 1
  const limit = opts.limit || 10
  const offset = (page - 1) * limit

  const countParams: string[] = []
  const dataParams: string[] = []
  let countIdx = 1
  let dataIdx = 1

  let whereClause = ''
  if (opts.search) {
    whereClause = ` WHERE product_name ILIKE $${countIdx++}`
    countParams.push(`%${opts.search}%`)
    dataIdx = countIdx
    dataParams.push(`%${opts.search}%`)
  }

  dataParams.push(String(limit))
  dataParams.push(String(offset))

  const countSql = `SELECT COUNT(*) AS total FROM vw_products_map${whereClause}`
  const dataSql = `
    SELECT * FROM vw_products_map${whereClause}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT $${dataIdx++} OFFSET $${dataIdx++}
  `

  return { countSql, dataSql, countParams, dataParams }
}

export function buildUpsertProductQuery(): string {
  return `
    INSERT INTO products (
      product_key, product_name, geojson_feature_id,
      category_id, sub_category_id, segment_id,
      cost, avg_selling_price, avg_order_revenue, avg_monthly_revenue,
      total_orders, total_revenue, total_quantity, total_customers,
      last_sale_date, recency, time_span,
      location, longitude, latitude
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14,
      $15, $16, $17,
      ST_SetSRID(ST_MakePoint($18, $19), 4326)::geography, $18, $19
    )
    ON CONFLICT (product_key) DO UPDATE SET
      product_name = EXCLUDED.product_name,
      category_id = EXCLUDED.category_id,
      sub_category_id = EXCLUDED.sub_category_id,
      segment_id = EXCLUDED.segment_id,
      cost = EXCLUDED.cost,
      avg_selling_price = EXCLUDED.avg_selling_price,
      avg_order_revenue = EXCLUDED.avg_order_revenue,
      avg_monthly_revenue = EXCLUDED.avg_monthly_revenue,
      total_orders = EXCLUDED.total_orders,
      total_revenue = EXCLUDED.total_revenue,
      total_quantity = EXCLUDED.total_quantity,
      total_customers = EXCLUDED.total_customers,
      last_sale_date = EXCLUDED.last_sale_date,
      recency = EXCLUDED.recency,
      time_span = EXCLUDED.time_span,
      location = EXCLUDED.location,
      longitude = EXCLUDED.longitude,
      latitude = EXCLUDED.latitude
    RETURNING (xmax = 0) AS inserted
  `
}

export function buildSnapshotQuery(): string {
  return `
    INSERT INTO product_health_snapshots (
      product_id, snapshot_date,
      total_orders, total_revenue, total_quantity, total_customers,
      recency, avg_monthly_revenue,
      health_score, health_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (product_id, snapshot_date) DO NOTHING
  `
}

export function buildCostDistributionQuery(): string {
  return `
    SELECT
      CASE
        WHEN cost < 10    THEN '< $10'
        WHEN cost < 100   THEN '$10 - $99'
        WHEN cost < 500   THEN '$100 - $499'
        WHEN cost < 1000  THEN '$500 - $999'
        ELSE '≥ $1000'
      END AS cost_range,
      COUNT(*) AS product_count,
      ROUND(AVG(cost)::NUMERIC, 2) AS avg_cost
    FROM products
    GROUP BY cost_range
    ORDER BY MIN(cost)
  `
}
