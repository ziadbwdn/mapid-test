import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types'
import MapPopup from './MapPopup'

interface MapContainerProps {
  geojson: GeoJSONCollection | null
  loading: boolean
  error: string | null
  onLegendReady: (legend: { label: string; color: string }[]) => void
}

type ThemeMode = 'standard' | 'topographical' | 'dark'

const CENTER: [number, number] = [110, -7.5]
const ZOOM = 6

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'osm-bg', type: 'raster' as const, source: 'osm' },
  ],
}

const THEME_BG: Record<ThemeMode, string> = {
  standard: '#f7f9fb',
  topographical: '#eceef0',
  dark: '#131b2e',
}

export default function MapContainer({ geojson, loading, error, onLegendReady }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const pendingData = useRef<GeoJSONCollection | null>(null)
  const mapReady = useRef(false)
  const [popup, setPopup] = useState<{ feature: GeoJSONFeature; x: number; y: number } | null>(null)
  const [theme, setTheme] = useState<ThemeMode>('standard')
  const [coords, setCoords] = useState({ lat: -7.5, lng: 110 })
  const legendReadyRef = useRef(onLegendReady)
  legendReadyRef.current = onLegendReady

  const applyData = useCallback((data: GeoJSONCollection) => {
    const map = mapRef.current
    if (!map || !mapReady.current) {
      pendingData.current = data
      return
    }
    const source = map.getSource('products') as maplibregl.GeoJSONSource | undefined
    if (source) {
      source.setData(data)
    } else {
      pendingData.current = data
    }
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
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
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#00668a',
          'text-halo-width': 1,
        },
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'products',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['coalesce', ['get', 'category_color'], '#6366f1'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      mapReady.current = true

      if (pendingData.current) {
        const source = map.getSource('products') as maplibregl.GeoJSONSource
        source.setData(pendingData.current)
        pendingData.current = null
      }

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

    map.on('error', (e) => {
      console.error('Map error:', e.error?.message || e)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (geojson) {
      applyData(geojson)

      const colors = new Map<string, string>()
      geojson.features.forEach((f) => {
        const cat = f.properties.category
        const col = f.properties.color
        if (cat && col && !colors.has(cat)) {
          colors.set(cat, col)
        }
      })
      const legend = Array.from(colors.entries()).map(([label, color]) => ({ label, color }))
      legendReadyRef.current(legend)
    }
  }, [geojson, applyData])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = mapContainer.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const lng = 105 + x * 10
    const lat = -5 - y * 5
    setCoords({ lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) })
  }

  const cycleTheme = () => {
    setTheme((t) => (t === 'standard' ? 'topographical' : t === 'topographical' ? 'dark' : 'standard'))
  }

  return (
    <div
      className="flex-1 relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: THEME_BG[theme] }}
    >
      {/* MapLibre canvas */}
      <div ref={mapContainer} className="absolute inset-0" style={{ opacity: theme === 'dark' ? 0.85 : 1 }} />

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#c6c6cd'} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          opacity: theme === 'dark' ? 0.5 : 0.6,
        }}
      />

      {/* Topographical contour lines */}
      {theme === 'topographical' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1000 800" preserveAspectRatio="none">
          <path d="M 50,100 C 150,120 200,80 350,150 S 500,300 650,220 S 800,280 950,200" fill="none" stroke="#00668a" strokeWidth="2" />
          <path d="M 30,130 C 130,150 180,110 330,180 S 480,330 630,250 S 780,310 930,230" fill="none" stroke="#00668a" strokeWidth="1.5" />
          <path d="M 10,160 C 110,180 160,140 310,210 S 460,360 610,280 S 760,340 910,260" fill="none" stroke="#00668a" strokeWidth="1" />
          <path d="M 120,400 C 220,420 300,350 480,480 S 720,550 850,420" fill="none" stroke="#00668a" strokeWidth="2" />
          <path d="M 100,430 C 200,450 280,380 460,510 S 700,580 830,450" fill="none" stroke="#00668a" strokeWidth="1.2" />
        </svg>
      )}

      {/* Theme toggle button */}
      <div className="absolute right-6 top-20 z-30 map-glass rounded-xl shadow-md border border-surface-border overflow-hidden">
        <button
          onClick={cycleTheme}
          className="p-3 hover:bg-white text-on-surface-variant hover:text-secondary transition-all cursor-pointer"
          title={`Theme: ${theme}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 right-4 z-30 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Loading map data...
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600/80 text-white text-xs px-4 py-1.5 rounded-full">
          {error}
        </div>
      )}

      {/* Coordinates HUD */}
      <div className="absolute bottom-6 right-6 z-40 bg-black/85 text-white/95 px-4 py-2 rounded-full font-mono-data text-xs tracking-widest backdrop-blur-md shadow-md border border-white/10 flex items-center gap-2 select-none">
        <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{coords.lat}° S, {coords.lng}° E</span>
      </div>

      {/* Popup */}
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
