import axios from 'axios'
import { Pool } from 'pg'
import config from '../config'
import logger from '../utils/logger'
import importRepository from '../repositories/importRepository'
import productRepository from '../repositories/productRepository'
import type { ProductRow, LookupTables } from '../types'

const SEGMENT_MAP: Record<string, string> = {
  'Mid-Rande': 'Mid-Range',
  'Mid-Range': 'Mid-Range',
  'High-Performer': 'High-Performer',
  'Low-Performer': 'Low-Performer'
}

interface GeoJSONFeature {
  id?: string
  geometry?: {
    coordinates: [number, number]
  }
  properties: Record<string, unknown>
}

interface NormalizedProduct {
  product_key: number
  product_name: string
  geojson_feature_id: string | null
  category: string
  sub_category: string
  segment_normalized: string
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

function importService(pool: Pool) {
  const importRepo = importRepository(pool)
  const productRepo = productRepository(pool)

  async function fetchGeoJSON(): Promise<GeoJSONFeature[]> {
    const response = await axios.get(config.geojson.apiUrl!)
    logger.info(`Fetched GeoJSON: ${response.data.features?.length || 0} features`)

    if (!response.data || !response.data.features) {
      throw new Error('Invalid GeoJSON response: missing features array')
    }

    return response.data.features
  }

  function normalizeFeature(feature: GeoJSONFeature): NormalizedProduct {
    const props = feature.properties
    const coords = feature.geometry?.coordinates || [0, 0]
    const segment = SEGMENT_MAP[String(props.product_segment)] || String(props.product_segment)

    let lastSaleDate = String(props.last_sale_date || '')
    if (lastSaleDate && lastSaleDate.includes('/')) {
      const parts = lastSaleDate.split('/')
      lastSaleDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }

    return {
      product_key: Number(props.product_key),
      product_name: String(props.product_name || '').trim(),
      geojson_feature_id: feature.id || String(props.id || '') || null,
      category: String(props.category || '').trim(),
      sub_category: String(props.sub_category || '').trim(),
      segment_normalized: segment,
      cost: parseFloat(String(props.cost)) || 0,
      avg_selling_price: parseFloat(String(props.avg_selling_price)) || 0,
      avg_order_revenue: parseFloat(String(props.avg_order_revenue)) || 0,
      avg_monthly_revenue: parseFloat(String(props.avg_monthly_revenue)) || 0,
      total_orders: parseInt(String(props.total_orders), 10) || 0,
      total_revenue: parseFloat(String(props.total_sales || props.total_revenue)) || 0,
      total_quantity: parseInt(String(props.total_quantity), 10) || 0,
      total_customers: parseInt(String(props.total_customers), 10) || 0,
      last_sale_date: lastSaleDate || null,
      recency: parseInt(String(props.recency), 10) || 0,
      time_span: parseInt(String(props.time_spam || props.time_span), 10) || 0,
      longitude: parseFloat(String(coords[0])),
      latitude: parseFloat(String(coords[1]))
    }
  }

  function lookupIds(
    feature: NormalizedProduct,
    lookups: LookupTables
  ): { category_id: string; sub_category_id: string; segment_id: string } {
    const categoryId = lookups.categoryMap.get(feature.category)
    const subCategoryId = lookups.subCategoryMap.get(`${feature.category}|${feature.sub_category}`)
    const segmentId = lookups.segmentMap.get(feature.segment_normalized)

    if (!categoryId) throw new Error(`Category not found: ${feature.category}`)
    if (!subCategoryId) throw new Error(`Sub-category not found: ${feature.category}|${feature.sub_category}`)
    if (!segmentId) throw new Error(`Segment not found: ${feature.segment_normalized}`)

    return {
      category_id: categoryId,
      sub_category_id: subCategoryId,
      segment_id: segmentId
    }
  }

  async function runImport() {
    const features = await fetchGeoJSON()
    const lookups = await productRepo.getLookupTables()

    const normalized: ProductRow[] = features.map(f => {
      const feat = normalizeFeature(f)
      const ids = lookupIds(feat, lookups)
      return { ...feat, ...ids }
    })

    const result = await importRepo.upsertBatch(normalized)

    const products = await productRepo.getAllProducts()
    const productKeyMap = new Map<number, Record<string, unknown>>()
    for (const p of products) {
      productKeyMap.set(Number(p.product_key), p)
    }

    const snapshotDate = new Date().toISOString().split('T')[0]
    const snapshots = normalized
      .filter(f => productKeyMap.has(f.product_key))
      .map(f => {
        const p = productKeyMap.get(f.product_key)!
        return {
          product_id: String(p.id),
          snapshot_date: snapshotDate,
          total_orders: f.total_orders,
          total_revenue: f.total_revenue,
          total_quantity: f.total_quantity,
          total_customers: f.total_customers,
          recency: f.recency,
          avg_monthly_revenue: f.avg_monthly_revenue,
          health_score: p.health_score as number | null,
          health_status: p.health_status as string | null
        }
      })

    if (snapshots.length > 0) {
      await importRepo.insertSnapshots(snapshots)
    }

    await importRepo.refreshMaterializedView()

    logger.info({ ...result, snapshots: snapshots.length }, 'Import completed')

    return {
      ...result,
      snapshots_taken: snapshots.length
    }
  }

  return { runImport, normalizeFeature }
}

export default importService
