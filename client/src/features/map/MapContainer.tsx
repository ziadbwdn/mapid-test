import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { Plus, Minus, Compass } from 'lucide-react'
import type { GeoJSONCollection, GeoJSONFeature } from '@/types'
import MapPopup from './MapPopup'

interface MapContainerProps {
  geojson: GeoJSONCollection
  loading: boolean
  error: string | null
  onLegendReady: (legend: { label: string; color: string }[]) => void
  onMapClick?: (lngLat: { lng: number; lat: number }) => void
  rulerActive: boolean
  bufferActive: boolean
  bufferCenter: { lng: number; lat: number } | null
  bufferRadiusKm: number
  onBufferApply: (center: { lng: number; lat: number }) => void
}

type ThemeMode = 'standard' | 'topographical' | 'dark' | 'satellite'

const CENTER: [number, number] = [110, -7.5]
const ZOOM = 6

const THEME_TILES: Record<ThemeMode, { url: string; attr: string }> = {
  standard: {
    url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap contributors, CARTO',
  },
  topographical: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap contributors',
  },
  dark: {
    url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap contributors, CARTO',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
}

function getMapStyle(theme: ThemeMode) {
  const tile = THEME_TILES[theme]
  return {
    version: 8 as const,
    sources: {
      'raster-tiles': {
        type: 'raster' as const,
        tiles: [tile.url],
        tileSize: 256,
        attribution: tile.attr,
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
  satellite: '#0a0a0a',
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function createCircleGeoJSON(center: [number, number], radiusKm: number, points = 64): GeoJSON.Feature {
  const coords: [number, number][] = []
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180))
  const distanceY = radiusKm / 110.574
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI)
    const x = distanceX * Math.cos(theta)
    const y = distanceY * Math.sin(theta)
    coords.push([center[0] + x, center[1] + y])
  }
  coords.push(coords[0])
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  }
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

  // Ruler sources
  map.addSource('ruler-line', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'ruler-line',
    type: 'line',
    source: 'ruler-line',
    paint: { 'line-color': '#00668a', 'line-width': 2, 'line-dasharray': [4, 2] },
  })

  map.addSource('ruler-points', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'ruler-points',
    type: 'circle',
    source: 'ruler-points',
    paint: { 'circle-color': '#00668a', 'circle-radius': 5, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' },
  })

  // Buffer source
  map.addSource('buffer-circle', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'buffer-circle',
    type: 'fill',
    source: 'buffer-circle',
    paint: { 'fill-color': 'rgba(0,102,138,0.15)', 'fill-outline-color': '#00668a' },
  })
}

export default function MapContainer({
  geojson,
  loading,
  error,
  onLegendReady,
  onMapClick,
  rulerActive,
  bufferActive,
  bufferCenter,
  bufferRadiusKm,
  onBufferApply,
}: MapContainerProps) {
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
  const [rulerPopup, setRulerPopup] = useState<{ lng: number; lat: number; text: string } | null>(null)
  const [rulerPoints, setRulerPoints] = useState<{ lng: number; lat: number }[]>([])
  const legendReadyRef = useRef(onLegendReady)
  legendReadyRef.current = onLegendReady
  const geojsonRef = useRef(geojson)
  geojsonRef.current = geojson
  const selectedFeatureRef = useRef(selectedFeature)
  selectedFeatureRef.current = selectedFeature
  const rulerPointsRef = useRef(rulerPoints)
  rulerPointsRef.current = rulerPoints
  const rulerActiveRef = useRef(rulerActive)
  rulerActiveRef.current = rulerActive
  const bufferActiveRef = useRef(bufferActive)
  bufferActiveRef.current = bufferActive
  const onBufferApplyRef = useRef(onBufferApply)
  onBufferApplyRef.current = onBufferApply
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  const applyData = useCallback((data: GeoJSONCollection) => {
    const map = mapRef.current
    if (!map || !mapReady.current) return
    const source = map.getSource('products') as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(data)
  }, [])

  const updateRulerLayers = useCallback(() => {
    const map = mapRef.current
    if (!map || !mapReady.current) return
    const pts = rulerPointsRef.current
    const lineSource = map.getSource('ruler-line') as maplibregl.GeoJSONSource | undefined
    const pointSource = map.getSource('ruler-points') as maplibregl.GeoJSONSource | undefined
    if (!lineSource || !pointSource) return

    if (pts.length === 2) {
      lineSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: pts.map((p) => [p.lng, p.lat]) },
            properties: {},
          },
        ],
      })
      pointSource.setData({
        type: 'FeatureCollection',
        features: pts.map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
          properties: {},
        })),
      })
    } else if (pts.length === 1) {
      lineSource.setData({ type: 'FeatureCollection', features: [] })
      pointSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [pts[0].lng, pts[0].lat] },
            properties: {},
          },
        ],
      })
    } else {
      lineSource.setData({ type: 'FeatureCollection', features: [] })
      pointSource.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [])

  const updateBufferLayer = useCallback(() => {
    const map = mapRef.current
    if (!map || !mapReady.current) return
    const source = map.getSource('buffer-circle') as maplibregl.GeoJSONSource | undefined
    if (!source) return
    if (bufferCenter && bufferRadiusKm > 0) {
      const circle = createCircleGeoJSON([bufferCenter.lng, bufferCenter.lat], bufferRadiusKm)
      source.setData({ type: 'FeatureCollection', features: [circle] })
    } else {
      source.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [bufferCenter, bufferRadiusKm])

  const reInitMapContent = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    initSourcesAndLayers(map, geojsonRef.current)
    mapReady.current = true
    applyData(geojsonRef.current)
    extractLegend(geojsonRef.current)
    updateRulerLayers()
    updateBufferLayer()
  }, [applyData, updateRulerLayers, updateBufferLayer])

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
      updateRulerLayers()
      updateBufferLayer()
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

      // Ruler mode
      if (rulerPointsRef.current.length < 2) {
        // allow pass-through; handled below
      }

      const lngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }

      if (rulerActiveRef.current) {
        setRulerPoints((prev) => {
          const next = prev.length >= 2 ? [lngLat] : [...prev, lngLat]
          if (next.length === 2) {
            const dist = haversineKm(next[0].lat, next[0].lng, next[1].lat, next[1].lng)
            setRulerPopup({
              lng: (next[0].lng + next[1].lng) / 2,
              lat: (next[0].lat + next[1].lat) / 2,
              text: `${dist.toFixed(2)} km`,
            })
            // Clear after 3 seconds
            setTimeout(() => {
              setRulerPopup(null)
              setRulerPoints([])
            }, 3000)
          }
          return next
        })
        return
      }

      if (bufferActiveRef.current) {
        onBufferApplyRef.current(lngLat)
        return
      }

      const features = map.queryRenderedFeatures(e.point)
      if (features.length === 0 && onMapClickRef.current) {
        onMapClickRef.current(lngLat)
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

  // Update popup position
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

  // Update ruler layers when rulerPoints changes
  useEffect(() => {
    updateRulerLayers()
  }, [rulerPoints, updateRulerLayers])

  // Update buffer layer when center/radius changes
  useEffect(() => {
    updateBufferLayer()
  }, [updateBufferLayer])

  // Theme change
  const setThemeMode = (next: ThemeMode) => {
    if (next === theme) return
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

  const themes: ThemeMode[] = ['standard', 'topographical', 'dark', 'satellite']

  return (
    <div className="flex-1 relative w-full overflow-hidden" style={{ backgroundColor: THEME_BG[theme] }}>
      {/* MapLibre canvas container */}
      <div ref={mapContainerRef} className="inset-0" style={{ position: 'absolute' }} />

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(${theme === 'dark' || theme === 'satellite' ? 'rgba(255,255,255,0.12)' : '#c6c6cd'} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          opacity: theme === 'dark' || theme === 'satellite' ? 0.5 : 0.6,
        }}
      />

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
        <div className="map-glass rounded-xl shadow-md border border-surface-border overflow-hidden bg-white/90 backdrop-blur-md">
          <button onClick={recenterMap} className="p-3 hover:bg-neutral-100 text-on-surface-variant hover:text-secondary transition-all cursor-pointer flex justify-center items-center w-full" title="Recenter on Indonesia">
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom-right: Layer pill switcher */}
      <div className="absolute bottom-6 right-6 z-40">
        <div className="map-glass rounded-full shadow-md border border-surface-border p-1 flex gap-1 bg-white/90 backdrop-blur-md">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setThemeMode(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-label-sm font-semibold transition-all cursor-pointer capitalize ${
                theme === t
                  ? 'bg-secondary text-white'
                  : 'text-on-surface-variant hover:text-secondary hover:bg-surface-container'
              }`}
            >
              {t === 'topographical' ? 'Topo' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-left: Coordinates HUD */}
      <div className="absolute bottom-6 left-[22rem] z-40 bg-black/85 text-white/95 px-4 py-2 rounded-full font-mono-data text-xs tracking-widest backdrop-blur-md shadow-md border border-white/10 flex items-center gap-2 select-none">
        <Compass className="w-3.5 h-3.5 text-secondary" />
        <span>
          {Math.abs(coords.lat)}° {coords.lat >= 0 ? 'N' : 'S'}, {Math.abs(coords.lng)}° {coords.lng >= 0 ? 'E' : 'W'}
        </span>
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

      {/* Ruler popup */}
      {rulerPopup && (
        <div
          className="absolute z-50 bg-secondary text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none font-semibold"
          style={{
            left: mapRef.current ? mapRef.current.project([rulerPopup.lng, rulerPopup.lat]).x : 0,
            top: mapRef.current ? mapRef.current.project([rulerPopup.lng, rulerPopup.lat]).y - 28 : 0,
            transform: 'translateX(-50%)',
          }}
        >
          {rulerPopup.text}
        </div>
      )}

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
