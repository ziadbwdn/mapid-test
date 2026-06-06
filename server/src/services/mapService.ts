import { Pool } from 'pg'
import productRepository from '../repositories/productRepository'
import type { GeoJSONFilters } from '../types'

function mapService(pool: Pool) {
  const productRepo = productRepository(pool)

  async function getGeoJSON(filters: GeoJSONFilters): Promise<Record<string, unknown>> {
    return productRepo.getGeoJSON(filters)
  }

  return { getGeoJSON }
}

export default mapService
