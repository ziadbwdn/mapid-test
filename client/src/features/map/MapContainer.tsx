import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Plus, Minus, Layers, Compass } from 'lucide-react'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types'
import MapPopup from './MapPopup'

interface MapContainerProps {
  geojson: GeoJSONCollection
  loading: boolean
  error: string | null
  onLegendReady: (legend: { label: string; color: string }[]) => void
  onMapClick?: (lngLat: { lng: number; lat: number }) => void
}

type ThemeMode = 'standard' | 'topographical' | 'dark'

const CENTER: [number, number] = [110, -7.5]
const ZOOM = 6

const getMapStyle = (theme: ThemeMode) => {
  let tilesUrl = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
  if (theme === 'dark') {
    tilesUrl = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  } else if (theme === 'topographical') {
    tilesUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
  return {
    version: 8 as const,
    sources: {
      'raster-tiles': {
        type: 'raster' as const,
        tiles: [tilesUrl],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, CARTO',
      },
    },
    layers: [
      { id: 'raster-layer', type: 'raster' as const, source: 'raster-tiles', minzoom: 0, maxzoom: 19 },
    ],
  }
}

const THEME_BG: Record<ThemeMode, string> = {
  standard: '#f7f9fb',
  topographical: '#eceef0',
  dark: '#131b2e',
}

function initSourcesAndLayers(map: maplibregl.Map, data: GeoJSONCollection) {
  if (map.getSource('products')) return

  map.addSource('products', {
    type: 'geojson',
    data,
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
}

export default function MapContainer({ geojson, loading, error, onLegendReady, onMapClick }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const mapReady = useRef(false)
  const [theme, setTheme] = useState<ThemeMode>('standard')
  const [coords, setCoords] = useState({ lat: -7.5, lng: 110 })
  const [selectedFeature, setSelectedFeature] = useState<{
    feature: GeoJSONFeature
    lngLat: { lng: number; lat: number }
  } | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const legendReadyRef = useRef(onLegendReady)
  legendReadyRef.current = onLegendReady
  const geojsonRef = useRef(geojson)
  geojsonRef.current = geojson
  const selectedFeatureRef = useRef(selectedFeature)
  selectedFeatureRef.current = selectedFeature

  const applyData = useCallback((data: GeoJSONCollection) => {
    const map = mapRef.current
    if (!map || !mapReady.current) return
    const source = map.getSource('products') as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(data)
  }, [])

  const reInitMapContent = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    initSourcesAndLayers(map, geojsonRef.current)
    mapReady.current = true
    applyData(geojsonRef.current)
    extractLegend(geojsonRef.current)
  }, [applyData])

  const updatePopupPosition = useCallback(() => {
    const map = mapRef.current
    const sel = selectedFeatureRef.current
    if (!map || !sel) {
      setPopupPos(null)
      return
    }
    const point = map.project([sel.lngLat.lng, sel.lngLat.lat])
    setPopupPos({ x: point.x, y: point.y })
  }, [])

  function extractLegend(data: GeoJSONCollection) {
    const colors = new Map<string, string>()
    data.features.forEach((f) => {
      const cat = f.properties.category
      const col = f.properties.color
      if (cat && col && !colors.has(cat)) {
        colors.set(cat, col as string)
      }
    })
    const legend = Array.from(colors.entries()).map(([label, color]) => ({ label, color }))
    legendReadyRef.current(legend)
  }

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(theme),
      center: CENTER,
      zoom: ZOOM,
      attributionControl: false,
    })

    map.on('load', () => {
      initSourcesAndLayers(map, geojsonRef.current)
      mapReady.current = true
      applyData(geojsonRef.current)
      extractLegend(geojsonRef.current)
    })

    map.on('error', (e) => {
      console.error('Map error:', e.error?.message || e)
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
      if (features.length > 0 && e.lngLat) {
        const feat = features[0] as unknown as GeoJSONFeature
        setSelectedFeature({ feature: feat, lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat } })
      }
    })

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement
      if (target.closest('.map-glass') || target.closest('button') || target.closest('aside')) return
      const features = map.queryRenderedFeatures(e.point)
      if (features.length === 0 && onMapClick) {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      }
    })

    map.on('mouseenter', 'cluster-layer', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'cluster-layer', () => { map.getCanvas().style.cursor = '' })
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })

    map.on('mousemove', (e: maplibregl.MapMouseEvent) => {
      setCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(4)),
        lng: parseFloat(e.lngLat.lng.toFixed(4)),
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update popup position on map move/zoom or selectedFeature change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    updatePopupPosition()
    map.on('move', updatePopupPosition)
    map.on('zoom', updatePopupPosition)
    return () => {
      map.off('move', updatePopupPosition)
      map.off('zoom', updatePopupPosition)
    }
  }, [selectedFeature, updatePopupPosition])

  // Apply data when geojson changes
  useEffect(() => {
    applyData(geojson)
    extractLegend(geojson)
  }, [geojson, applyData])

  // Theme change
  const cycleTheme = () => {
    const next = theme === 'standard' ? 'topographical' : theme === 'topographical' ? 'dark' : 'standard'
    setTheme(next)
    const map = mapRef.current
    if (!map) return
    mapReady.current = false
    map.setStyle(getMapStyle(next))
    map.once('style.load', () => reInitMapContent())
  }

  const recenterMap = () => {
    mapRef.current?.easeTo({ center: CENTER, zoom: ZOOM })
  }

  const zoomIn = () => mapRef.current?.zoomIn()
  const zoomOut = () => mapRef.current?.zoomOut()

  return (
    <div className="flex-1 relative w-full overflow-hidden" style={{ backgroundColor: THEME_BG[theme] }}>
      {/* MapLibre canvas container — inline style avoids absolute class conflict with .maplibregl-map {position:relative} */}
      <div ref={mapContainerRef} className="inset-0" style={{ position: 'absolute' }} />

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

      {/* Right-side controls */}
      <div className="absolute right-6 top-6 z-30 flex flex-col gap-3">
        <div className="map-glass flex flex-col rounded-xl shadow-md border border-surface-border overflow-hidden bg-white/90 backdrop-blur-md">
          <button onClick={zoomIn} className="p-3 hover:bg-neutral-100 text-on-surface-variant hover:text-secondary transition-all border-b border-surface-border cursor-pointer flex justify-center items-center" title="Zoom In">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={zoomOut} className="p-3 hover:bg-neutral-100 text-on-surface-variant hover:text-secondary transition-all cursor-pointer flex justify-center items-center" title="Zoom Out">
            <Minus className="w-5 h-5" />
          </button>
        </div>
        <div className="map-glass rounded-xl shadow-md border border-surface-border overflow-hidden bg-white/90 backdrop-blur-md relative group">
          <button onClick={cycleTheme} className="p-3 hover:bg-neutral-100 text-on-surface-variant hover:text-secondary transition-all cursor-pointer flex justify-center items-center w-full" title="Toggle Map Layer">
            <Layers className="w-5 h-5" />
          </button>
          <span className="absolute right-14 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-xs px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none capitalize z-40">
            Overlay: {theme}
          </span>
        </div>
        <div className="map-glass rounded-xl shadow-md border border-surface-border overflow-hidden bg-white/90 backdrop-blur-md">
          <button onClick={recenterMap} className="p-3 hover:bg-neutral-100 text-on-surface-variant hover:text-secondary transition-all cursor-pointer flex justify-center items-center w-full" title="Recenter on Indonesia">
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
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
        <Compass className="w-3.5 h-3.5 text-secondary" />
        <span>
          {Math.abs(coords.lat)}° {coords.lat >= 0 ? 'N' : 'S'}, {Math.abs(coords.lng)}° {coords.lng >= 0 ? 'E' : 'W'}
        </span>
      </div>

      {/* Popup */}
      {selectedFeature && popupPos && (
        <MapPopup
          feature={selectedFeature.feature}
          x={popupPos.x}
          y={popupPos.y}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  )
}
