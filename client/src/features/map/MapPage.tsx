import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGeoJSON } from '@/hooks/useGeoJSON'
import { useDebounce } from '@/hooks/useDebounce'
import { generateMockGeoJSON } from '@/utils/mockGeoJSON'
import MapSidebar from './MapSidebar'
import MapContainer from './MapContainer'
import MapLegend from './MapLegend'
import type { GeoJSONCollection } from '@/types'

const CATEGORIES = ['Accessories', 'Bikes', 'Clothing']

function getEffectiveData(
  geojson: GeoJSONCollection | null,
  loading: boolean,
  category: string,
  segment: string,
  search: string,
): GeoJSONCollection {
  if (geojson && geojson.features.length > 0) return geojson
  if (!loading) {
    const mock = generateMockGeoJSON()
    let features = mock.features
    if (category) {
      features = features.filter((f) => f.properties.category === category)
    }
    if (segment) {
      features = features.filter((f) => f.properties.segment === segment)
    }
    if (search) {
      const q = search.toLowerCase()
      features = features.filter((f) => f.properties.product_name.toLowerCase().includes(q))
    }
    return { type: 'FeatureCollection', features }
  }
  return geojson ?? { type: 'FeatureCollection', features: [] }
}

let customPinCounter = 0

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const segment = searchParams.get('segment') || ''
  const searchRaw = searchParams.get('search') || ''
  const search = useDebounce(searchRaw, 300)
  const [legendItems, setLegendItems] = useState<{ label: string; color: string }[]>([])
  const [customPins, setCustomPins] = useState<GeoJSONCollection>({ type: 'FeatureCollection', features: [] })

  const endpoint = '/map/geojson'
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (segment) params.segment = segment
  if (search) params.search = search

  const { data: geojson, loading, error } = useGeoJSON(endpoint, params)

  const baseData = useMemo(
    () => getEffectiveData(geojson as GeoJSONCollection | null, loading, category, segment, search),
    [geojson, loading, category, segment, search],
  )

  const effectiveData = useMemo<GeoJSONCollection>(() => {
    if (customPins.features.length === 0) return baseData
    return {
      type: 'FeatureCollection',
      features: [...baseData.features, ...customPins.features],
    }
  }, [baseData, customPins])

  const setParam = useCallback(
    (key: string, val: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (val) {
          next.set(key, val)
        } else {
          next.delete(key)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const handleLegendReady = useCallback((items: { label: string; color: string }[]) => {
    setLegendItems(items)
  }, [])

  const handleMapClick = useCallback((lngLat: { lng: number; lat: number }) => {
    customPinCounter++
    const newPin: GeoJSONCollection['features'][0] = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] },
      properties: {
        id: `custom-${customPinCounter}-${Date.now()}`,
        product_key: 90000 + customPinCounter,
        product_name: `Custom Pin #${customPinCounter}`,
        category: 'Accessories',
        color: '#6366f1',
        category_color: '#6366f1',
        segment: 'Mid-Range',
        segment_color: '#f59e0b',
        cost: 500,
        avg_selling_price: 800,
        total_revenue: 50000,
        total_orders: 60,
        total_quantity: 100,
        health_score: 75,
        health_status: 'Healthy',
        latitude: lngLat.lat,
        longitude: lngLat.lng,
        recency: 135,
        time_span: 60,
      },
    }
    setCustomPins((prev) => ({
      type: 'FeatureCollection',
      features: [...prev.features, newPin],
    }))
  }, [])

  const handleRunAnalysis = useCallback(() => {
    const mock = generateMockGeoJSON()
    const newFeatures = mock.features.slice(0, 8).map((f) => ({
      ...f,
      properties: { ...f.properties, id: `sim-${Date.now()}-${Math.random()}` },
      geometry: {
        type: 'Point' as const,
        coordinates: [
          f.geometry.coordinates[0] + (Math.random() - 0.5) * 4,
          f.geometry.coordinates[1] + (Math.random() - 0.5) * 2,
        ] as [number, number],
      },
    }))
    setCustomPins((prev) => ({
      type: 'FeatureCollection',
      features: [...prev.features, ...newFeatures],
    }))
  }, [])

  const handleReset = useCallback(() => {
    setCustomPins({ type: 'FeatureCollection', features: [] })
  }, [])

  return (
    <main className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden bg-surface-container">
      <MapSidebar
        category={category}
        segment={segment}
        search={searchRaw}
        categories={CATEGORIES}
        totalPins={effectiveData.features.length}
        onCategoryChange={(v) => setParam('category', v)}
        onSegmentChange={(v) => setParam('segment', v)}
        onSearchChange={(v) => setParam('search', v)}
        onRunAnalysis={handleRunAnalysis}
        onReset={handleReset}
      />

      <MapContainer
        geojson={effectiveData}
        loading={loading}
        error={error}
        onLegendReady={handleLegendReady}
        onMapClick={handleMapClick}
      />

      <MapLegend legend={legendItems} />
    </main>
  )
}
