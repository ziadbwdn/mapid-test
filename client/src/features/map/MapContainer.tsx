import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types'
import MapPopup from './MapPopup'

interface MapContainerProps {
  geojson: GeoJSONCollection | null
  loading: boolean
  onLegendReady: (legend: { label: string; color: string }[]) => void
}

const CENTER: [number, number] = [110, -7.5]
const ZOOM = 6

export default function MapContainer({ geojson, loading, onLegendReady }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [popup, setPopup] = useState<{ feature: GeoJSONFeature; x: number; y: number } | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: CENTER,
      zoom: ZOOM,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      map.addSource('products', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      map.addLayer({
        id: 'cluster-layer',
        type: 'circle',
        source: 'products',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#00668a',
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 500, 40],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'products',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'products',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.on('click', 'cluster-layer', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['cluster-layer'] })
        const clusterId = features[0]?.properties?.cluster_id
        if (clusterId && e.lngLat) {
          const source = map.getSource('products') as maplibregl.GeoJSONSource
          const zoom = await source.getClusterExpansionZoom(clusterId)
          map.easeTo({ center: e.lngLat, zoom })
        }
      })

      map.on('click', 'unclustered-point', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
        if (features.length > 0 && e.originalEvent) {
          const feat = features[0] as unknown as GeoJSONFeature
          const rect = mapContainer.current!.getBoundingClientRect()
          setPopup({
            feature: feat,
            x: e.originalEvent.clientX - rect.left,
            y: e.originalEvent.clientY - rect.top,
          })
        }
      })

      map.on('mouseenter', 'cluster-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'cluster-layer', () => {
        map.getCanvas().style.cursor = ''
      })
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !geojson) return
    const source = mapRef.current.getSource('products') as maplibregl.GeoJSONSource
    if (source) {
      source.setData(geojson)
    }
  }, [geojson])

  useEffect(() => {
    if (!geojson) return
    const colors = new Map<string, string>()
    geojson.features.forEach((f) => {
      const cat = f.properties.category
      const col = f.properties.color
      if (cat && col && !colors.has(cat)) {
        colors.set(cat, col)
      }
    })
    const legend = Array.from(colors.entries()).map(([label, color]) => ({ label, color }))
    onLegendReady(legend)
  }, [geojson, onLegendReady])

  return (
    <div className="flex-1 relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {loading && (
        <div className="absolute top-4 right-4 z-30 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Loading map data...
        </div>
      )}
      {popup && (
        <MapPopup
          feature={popup.feature}
          x={popup.x}
          y={popup.y}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
