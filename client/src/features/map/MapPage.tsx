import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApiData } from '@/hooks/useApiData'
import { useDebounce } from '@/hooks/useDebounce'
import type { GeoJSONCollection } from '@/types'
import MapSidebar from './MapSidebar'
import MapContainer from './MapContainer'
import MapLegend from './MapLegend'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { KPICardSkeleton } from '@/components/ui/Skeleton'

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

  const { data: geojson, loading, error, refetch } = useApiData<GeoJSONCollection>(endpoint, params)

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

      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      ) : !geojson && !loading ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState message="No map data available. Import data first." />
        </div>
      ) : loading && !geojson ? (
        <div className="flex-1 flex items-center justify-center">
          <KPICardSkeleton />
        </div>
      ) : (
        <MapContainer
          geojson={geojson}
          loading={loading}
          onLegendReady={(items) => setLegendItems(items)}
        />
      )}

      <MapLegend legend={legendItems} />
    </main>
  )
}
