import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGeoJSON } from '@/hooks/useGeoJSON'

describe('useGeoJSON', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with loading state', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)

    const { result } = renderHook(() => useGeoJSON('/map/geojson'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches and returns GeoJSON data', async () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [106, -6] }, properties: {} }]
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geojson)
    } as Response)

    const { result } = renderHook(() => useGeoJSON('/map/geojson'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(geojson)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failed'))

    const { result } = renderHook(() => useGeoJSON('/map/geojson'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network failed')
  })

  it('passes params as query string', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ type: 'FeatureCollection', features: [] })
    } as Response)

    renderHook(() => useGeoJSON('/map/geojson', { category: 'Bikes', segment: 'High-Performer' }))

    await waitFor(() => {
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('category=Bikes')
      expect(url).toContain('segment=High-Performer')
    })
  })
})
