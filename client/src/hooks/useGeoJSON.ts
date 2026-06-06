import { useState, useEffect, useCallback, useRef } from 'react'
import type { GeoJSONCollection } from '@/types'
import { fetchApi } from '@/services/api'

export interface UseGeoJSONResult {
  data: GeoJSONCollection | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useGeoJSON(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): UseGeoJSONResult {
  const [data, setData] = useState<GeoJSONCollection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchId, setFetchId] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const refetch = useCallback(() => {
    setFetchId((id) => id + 1)
  }, [])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    const searchParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.set(key, String(value))
        }
      }
    }
    const qs = searchParams.toString()
    const url = `${BASE_URL}${endpoint}${qs ? `?${qs}` : ''}`

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((json) => {
        if (!controller.signal.aborted) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          setError(message)
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [endpoint, JSON.stringify(params), fetchId])

  return { data, loading, error, refetch }
}
