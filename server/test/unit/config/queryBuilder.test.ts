import { describe, it, expect } from 'vitest'
import {
  buildGeoJSONQuery,
  buildPaginatedProductQuery,
  buildUpsertProductQuery,
  buildSnapshotQuery,
  buildCostDistributionQuery
} from '../../../src/config/queryBuilder'

describe('buildGeoJSONQuery', () => {
  it('returns SQL with no filters when called without args', () => {
    const result = buildGeoJSONQuery()
    expect(result.sql).toContain('FROM vw_products_map')
    expect(result.sql).not.toContain('WHERE')
    expect(result.params).toEqual([])
  })

  it('adds category filter', () => {
    const result = buildGeoJSONQuery({ category: 'Bikes' })
    expect(result.sql).toContain('WHERE')
    expect(result.sql).toContain('category = $1')
    expect(result.params).toEqual(['Bikes'])
  })

  it('adds segment filter', () => {
    const result = buildGeoJSONQuery({ segment: 'High-Performer' })
    expect(result.sql).toContain('segment = $1')
    expect(result.params).toEqual(['High-Performer'])
  })

  it('adds search filter with ILIKE', () => {
    const result = buildGeoJSONQuery({ search: 'helmet' })
    expect(result.sql).toContain('ILIKE $1')
    expect(result.params).toEqual(['%helmet%'])
  })

  it('combines multiple filters with AND', () => {
    const result = buildGeoJSONQuery({ category: 'Bikes', segment: 'High-Performer', search: 'road' })
    expect(result.sql).toContain('category = $1')
    expect(result.sql).toContain('segment = $2')
    expect(result.sql).toContain('ILIKE $3')
    expect(result.params).toEqual(['Bikes', 'High-Performer', '%road%'])
  })
})

describe('buildPaginatedProductQuery', () => {
  it('returns default pagination without filters', () => {
    const result = buildPaginatedProductQuery()
    expect(result.countSql).toContain('SELECT COUNT(*) AS total FROM vw_products_map')
    expect(result.dataSql).toContain('LIMIT ')
    expect(result.dataSql).toContain('OFFSET ')
    expect(result.countParams).toEqual([])
    expect(result.dataParams).toEqual(['10', '0'])
  })

  it('applies search filter to both count and data', () => {
    const result = buildPaginatedProductQuery({ search: 'bike', page: 2, limit: 5 })
    expect(result.countSql).toContain('ILIKE $1')
    expect(result.dataSql).toContain('ILIKE $1')
    expect(result.countParams).toEqual(['%bike%'])
    expect(result.dataParams[0]).toBe('%bike%')
  })

  it('applies sort with allowed column', () => {
    const result = buildPaginatedProductQuery({ sort_by: 'total_revenue', sort_order: 'desc' })
    expect(result.dataSql).toContain('ORDER BY total_revenue DESC')
  })

  it('defaults to ASC order', () => {
    const result = buildPaginatedProductQuery({ sort_by: 'cost' })
    expect(result.dataSql).toContain('ORDER BY cost ASC')
  })

  it('defaults to product_name for invalid sort column', () => {
    const result = buildPaginatedProductQuery({ sort_by: 'invalid_col' })
    expect(result.dataSql).toContain('ORDER BY product_name')
  })
})

describe('buildUpsertProductQuery', () => {
  it('returns SQL with ON CONFLICT clause', () => {
    const sql = buildUpsertProductQuery()
    expect(sql).toContain('INSERT INTO products')
    expect(sql).toContain('ON CONFLICT (product_key) DO UPDATE SET')
    expect(sql).toContain('ST_SetSRID(ST_MakePoint($18, $19), 4326)::geography')
  })
})

describe('buildSnapshotQuery', () => {
  it('returns SQL with ON CONFLICT DO NOTHING', () => {
    const sql = buildSnapshotQuery()
    expect(sql).toContain('INSERT INTO product_health_snapshots')
    expect(sql).toContain('ON CONFLICT (product_id, snapshot_date) DO NOTHING')
  })
})

describe('buildCostDistributionQuery', () => {
  it('returns SQL with CASE expression', () => {
    const sql = buildCostDistributionQuery()
    expect(sql).toContain('CASE')
    expect(sql).toContain('FROM products')
    expect(sql).toContain('GROUP BY cost_range')
    expect(sql).toContain('ORDER BY MIN(cost)')
  })
})
