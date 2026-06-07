import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGeoJSON } from '@/hooks/useGeoJSON'
import { useDebounce } from '@/hooks/useDebounce'
import { generateMockGeoJSON } from '@/utils/mockGeoJSON'
import MapSidebar from './MapSidebar'
import MapContainer from './MapContainer'
import type { GeoJSONCollection } from '@/types'
import { fetchApi } from '@/services/api'

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

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const segment = searchParams.get('segment') || ''
  const searchRaw = searchParams.get('search') || ''
  const search = useDebounce(searchRaw, 300)
  const [legendItems, setLegendItems] = useState<{ label: string; color: string }[]>([])
  const [customPins, setCustomPins] = useState<GeoJSONCollection>({ type: 'FeatureCollection', features: [] })

  // Spatial console state
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [rulerActive, setRulerActive] = useState(false)
  const [bufferActive, setBufferActive] = useState(false)
  const [bufferCenter, setBufferCenter] = useState<{ lng: number; lat: number } | null>(null)
  const [bufferRadiusKm, setBufferRadiusKm] = useState(50)
  const [bufferResults, setBufferResults] = useState<GeoJSONCollection | null>(null)

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
    if (bufferResults) {
      // When buffer is active, show only buffer results + custom pins
      return {
        type: 'FeatureCollection',
        features: [...bufferResults.features, ...customPins.features],
      }
    }
    if (customPins.features.length === 0) return baseData
    return {
      type: 'FeatureCollection',
      features: [...baseData.features, ...customPins.features],
    }
  }, [baseData, customPins, bufferResults])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    effectiveData.features.forEach((f) => {
      const cat = f.properties.category as string
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    })
    return counts
  }, [effectiveData])

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

  // Ruler
  const handleRulerToggle = useCallback(() => {
    setRulerActive((prev) => !prev)
    setBufferActive(false)
  }, [])

  // Buffer
  const handleBufferToggle = useCallback(() => {
    setBufferActive((prev) => !prev)
    setRulerActive(false)
  }, [])

  const handleBufferApply = useCallback((center: { lng: number; lat: number }) => {
    setBufferCenter(center)
  }, [])

  const handleClearBuffer = useCallback(() => {
    setBufferCenter(null)
    setBufferResults(null)
    setBufferActive(false)
  }, [])

  // Fetch radius search when buffer params change
  useEffect(() => {
    if (!bufferCenter || !bufferActive) {
      setBufferResults(null)
      return
    }
    let cancelled = false
    fetchApi<Array<{
      product_id: string
      product_name: string
      category_name: string
      segment_name: string
      health_status: string
      distance_meters: number
      longitude: number
      latitude: number
    }>>('/map/radius-search', {
      lng: bufferCenter.lng,
      lat: bufferCenter.lat,
      radius: bufferRadiusKm * 1000,
    })
      .then((res) => {
        if (cancelled) return
        const rows = res.data
        const features = rows.map((r) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [r.longitude, r.latitude] as [number, number],
          },
          properties: {
            id: r.product_id,
            product_name: r.product_name,
            category: r.category_name,
            segment: r.segment_name,
            health_status: r.health_status,
            distance_meters: r.distance_meters,
            product_key: 0,
            color: '#6366f1',
            category_color: '#6366f1',
          },
        })) as unknown as GeoJSONCollection['features']
        setBufferResults({ type: 'FeatureCollection', features })
      })
      .catch(() => {
        if (!cancelled) setBufferResults(null)
      })
    return () => {
      cancelled = true
    }
  }, [bufferCenter, bufferRadiusKm, bufferActive])

  return (
    <main className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden bg-surface-container">
      <MapSidebar
        category={category}
        segment={segment}
        search={searchRaw}
        categories={CATEGORIES}
        totalPins={effectiveData.features.length}
        legend={legendItems}
        categoryCounts={categoryCounts}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((p) => !p)}
        rulerActive={rulerActive}
        bufferActive={bufferActive}
        bufferRadiusKm={bufferRadiusKm}
        hasBufferResult={!!bufferResults}
        onCategoryChange={(v) => setParam('category', v)}
        onSegmentChange={(v) => setParam('segment', v)}
        onSearchChange={(v) => setParam('search', v)}
        onRulerToggle={handleRulerToggle}
        onBufferToggle={handleBufferToggle}
        onBufferRadiusChange={setBufferRadiusKm}
        onClearBuffer={handleClearBuffer}
      />

      <MapContainer
        geojson={effectiveData}
        loading={loading}
        error={error}
        onLegendReady={handleLegendReady}
        rulerActive={rulerActive}
        bufferActive={bufferActive}
        bufferCenter={bufferCenter}
        bufferRadiusKm={bufferRadiusKm}
        onBufferApply={handleBufferApply}
      />
    </main>
  )
}
