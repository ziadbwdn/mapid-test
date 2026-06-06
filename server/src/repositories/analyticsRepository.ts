import { Pool } from 'pg'
import { buildCostDistributionQuery } from '../config/queryBuilder'
import type { KPIResult, DimensionRow, CostDistRow } from '../types'

function analyticsRepository(pool: Pool) {
  const costDistSql = buildCostDistributionQuery()

  async function getKPI(): Promise<KPIResult | null> {
    const { rows } = await pool.query('SELECT * FROM vw_kpi_summary')
    return rows[0] || null
  }

  async function getCategoryDistribution(): Promise<DimensionRow[]> {
    const { rows } = await pool.query(`
      SELECT dimension_value, product_count, total_revenue, color_code
      FROM mv_analytics_summary
      WHERE dimension_type = 'category'
      ORDER BY total_revenue DESC
    `)
    return rows
  }

  async function getSegmentDistribution(): Promise<DimensionRow[]> {
    const { rows } = await pool.query(`
      SELECT dimension_value, product_count, total_revenue, color_code
      FROM mv_analytics_summary
      WHERE dimension_type = 'segment'
      ORDER BY total_revenue DESC
    `)
    return rows
  }

  async function getCostDistribution(): Promise<CostDistRow[]> {
    const { rows } = await pool.query(costDistSql)
    return rows
  }

  async function getHealthReport(): Promise<Record<string, unknown>[]> {
    const { rows } = await pool.query(`
      SELECT product_name, category, segment, recency, time_span,
             total_orders, avg_monthly_revenue, health_score, health_status
      FROM vw_products_map
      ORDER BY health_score ASC
    `)
    return rows
  }

  return {
    getKPI,
    getCategoryDistribution,
    getSegmentDistribution,
    getCostDistribution,
    getHealthReport
  }
}

export default analyticsRepository
