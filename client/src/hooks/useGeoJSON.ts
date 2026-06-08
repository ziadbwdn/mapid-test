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

    fetchApi<GeoJSONCollection>(endpoint, params, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res.data)
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
