import { Pool } from 'pg'
import productRepository from '../repositories/productRepository'
import type { GeoJSONFilters } from '../types'

function mapService(pool: Pool) {
  const productRepo = productRepository(pool)

  async function getGeoJSON(filters: GeoJSONFilters): Promise<Record<string, unknown>> {
    return productRepo.getGeoJSON(filters)
  }

  async function getRadiusSearch(
    longitude: number,
    latitude: number,
    radiusMeters: number
  ): Promise<Record<string, unknown>[]> {
    return productRepo.getProductsWithinRadius(longitude, latitude, radiusMeters)
  }

  return { getGeoJSON, getRadiusSearch }
}

export default mapService
