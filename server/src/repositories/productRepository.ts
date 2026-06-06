import { Pool } from 'pg'
import { buildGeoJSONQuery, buildPaginatedProductQuery } from '../config/queryBuilder'
import type { GeoJSONFilters, PaginateOpts, PaginatedResult, LookupTables } from '../types'

function productRepository(pool: Pool) {
  async function getGeoJSON(filters: GeoJSONFilters = {}): Promise<Record<string, unknown>> {
    const { sql, params } = buildGeoJSONQuery(filters)
    const { rows } = await pool.query(sql, params)
    return rows[0]?.geojson || { type: 'FeatureCollection', features: [] }
  }

  async function getPaginated(opts: PaginateOpts = {}): Promise<PaginatedResult> {
    const { countSql, dataSql, countParams, dataParams } = buildPaginatedProductQuery(opts)

    const countResult = await pool.query(countSql, countParams)
    const total = parseInt(countResult.rows[0].total, 10)

    const { rows } = await pool.query(dataSql, dataParams)

    return { data: rows, total }
  }

  async function getAllProducts(): Promise<Record<string, unknown>[]> {
    const { rows } = await pool.query('SELECT * FROM vw_products_map')
    return rows
  }

  async function findProductByKey(productKey: number): Promise<{ id: string } | null> {
    const { rows } = await pool.query(
      'SELECT id FROM products WHERE product_key = $1',
      [productKey]
    )
    return rows[0] || null
  }

  async function getLookupTables(): Promise<LookupTables> {
    const { rows: categories } = await pool.query('SELECT id, name FROM categories')
    const { rows: subCategories } = await pool.query(`
      SELECT sc.id, sc.name, c.name AS category_name
      FROM sub_categories sc
      JOIN categories c ON c.id = sc.category_id
    `)
    const { rows: segments } = await pool.query('SELECT id, name FROM product_segments')

    const categoryMap = new Map<string, string>(categories.map(c => [c.name, c.id]))
    const subCategoryMap = new Map<string, string>(
      subCategories.map((s: { category_name: string; name: string; id: string }) => [`${s.category_name}|${s.name}`, s.id])
    )
    const segmentMap = new Map<string, string>(segments.map(s => [s.name, s.id]))

    return { categoryMap, subCategoryMap, segmentMap }
  }

  return {
    getGeoJSON,
    getPaginated,
    getAllProducts,
    findProductByKey,
    getLookupTables
  }
}

export default productRepository
