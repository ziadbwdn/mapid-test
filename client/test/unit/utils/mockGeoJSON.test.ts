import { describe, it, expect } from 'vitest'
import { generateMockGeoJSON } from '@/utils/mockGeoJSON'

describe('generateMockGeoJSON', () => {
  it('returns a valid GeoJSON FeatureCollection', () => {
    const result = generateMockGeoJSON()
    expect(result).toHaveProperty('type', 'FeatureCollection')
    expect(result).toHaveProperty('features')
    expect(Array.isArray(result.features)).toBe(true)
  })

  it('generates 100 features', () => {
    const result = generateMockGeoJSON()
    expect(result.features).toHaveLength(100)
  })

  it('each feature has type, geometry, and properties', () => {
    const result = generateMockGeoJSON()
    for (const f of result.features) {
      expect(f.type).toBe('Feature')
      expect(f.geometry.type).toBe('Point')
      expect(f.geometry.coordinates).toHaveLength(2)
      expect(f.geometry.coordinates[0]).toBeGreaterThanOrEqual(105)
      expect(f.geometry.coordinates[1]).toBeGreaterThanOrEqual(-9)
      expect(f.properties).toHaveProperty('product_name')
      expect(f.properties).toHaveProperty('category')
      expect(f.properties).toHaveProperty('color')
    }
  })

  it('features have all required properties', () => {
    const result = generateMockGeoJSON()
    const feature = result.features[0]
    const props = feature.properties
    expect(props).toHaveProperty('id')
    expect(props).toHaveProperty('product_key')
    expect(props).toHaveProperty('product_name')
    expect(props).toHaveProperty('category')
    expect(props).toHaveProperty('color')
    expect(props).toHaveProperty('cost')
    expect(props).toHaveProperty('avg_selling_price')
    expect(props).toHaveProperty('total_revenue')
    expect(props).toHaveProperty('total_orders')
    expect(props).toHaveProperty('health_score')
    expect(props).toHaveProperty('health_status')
    expect(props).toHaveProperty('latitude')
    expect(props).toHaveProperty('longitude')
  })

  it('produces deterministic output shape (not testing exact values due to Date.now seed)', () => {
    const result1 = generateMockGeoJSON()
    const result2 = generateMockGeoJSON()
    expect(result1.features.length).toBe(result2.features.length)
    expect(result1.features[0].geometry.type).toBe('Point')
  })
})
