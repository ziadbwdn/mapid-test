import { Pool } from 'pg'
import { buildUpsertProductQuery, buildSnapshotQuery } from '../config/queryBuilder'
import type { ProductRow, SnapshotRow, UpsertResult } from '../types'

function importRepository(pool: Pool) {
  const upsertSql = buildUpsertProductQuery()
  const snapshotSql = buildSnapshotQuery()

  async function upsertBatch(products: ProductRow[]): Promise<UpsertResult> {
    const client = await pool.connect()
    try {
      let imported = 0
      let updated = 0

      for (const p of products) {
        const { rows } = await client.query(upsertSql, [
          p.product_key, p.product_name, p.geojson_feature_id,
          p.category_id, p.sub_category_id, p.segment_id,
          p.cost, p.avg_selling_price, p.avg_order_revenue, p.avg_monthly_revenue,
          p.total_orders, p.total_revenue, p.total_quantity, p.total_customers,
          p.last_sale_date, p.recency, p.time_span,
          p.longitude, p.latitude
        ])

        if (rows[0].inserted) {
          imported++
        } else {
          updated++
        }
      }

      return { imported, updated }
    } finally {
      client.release()
    }
  }

  async function insertSnapshots(snapshotData: SnapshotRow[]): Promise<{ inserted: number }> {
    if (snapshotData.length === 0) return { inserted: 0 }

    const client = await pool.connect()
    try {
      let inserted = 0

      for (const s of snapshotData) {
        await client.query(snapshotSql, [
          s.product_id, s.snapshot_date,
          s.total_orders, s.total_revenue, s.total_quantity, s.total_customers,
          s.recency, s.avg_monthly_revenue,
          s.health_score, s.health_status
        ])
        inserted++
      }

      return { inserted }
    } finally {
      client.release()
    }
  }

  async function refreshMaterializedView(): Promise<void> {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_summary')
  }

  return {
    upsertBatch,
    insertSnapshots,
    refreshMaterializedView
  }
}

export default importRepository
