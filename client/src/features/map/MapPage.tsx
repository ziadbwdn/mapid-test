import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGeoJSON } from '@/hooks/useGeoJSON'
import { useDebounce } from '@/hooks/useDebounce'
import MapSidebar from './MapSidebar'
import MapContainer from './MapContainer'
import MapLegend from './MapLegend'

const CATEGORIES = ['Accessories', 'Bikes', 'Clothing']

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const segment = searchParams.get('segment') || ''
  const searchRaw = searchParams.get('search') || ''
  const search = useDebounce(searchRaw, 300)
  const [legendItems, setLegendItems] = useState<{ label: string; color: string }[]>([])

  const endpoint = '/map/geojson'
  const params: Record<string, string> = {}
  if (category) params.category = category
  if (segment) params.segment = segment
  if (search) params.search = search

  const { data: geojson, loading, error } = useGeoJSON(endpoint, params)

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

  return (
    <main className="relative w-full h-[calc(100vh-64px)] flex overflow-hidden bg-surface-container">
      <MapSidebar
        category={category}
        segment={segment}
        search={searchRaw}
        categories={CATEGORIES}
        onCategoryChange={(v) => setParam('category', v)}
        onSegmentChange={(v) => setParam('segment', v)}
        onSearchChange={(v) => setParam('search', v)}
      />

      <MapContainer
        geojson={geojson}
        loading={loading}
        error={error}
        onLegendReady={handleLegendReady}
      />

      <MapLegend legend={legendItems} />
    </main>
  )
}
