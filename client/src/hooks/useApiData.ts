import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchApi } from '@/services/api'

export interface UseApiDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useApiData<T>(
  endpoint: string | null,
  params?: Record<string, string | number | undefined>,
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchId, setFetchId] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const refetch = useCallback(() => {
    setFetchId((id) => id + 1)
  }, [])

  useEffect(() => {
    if (!endpoint) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    fetchApi<T>(endpoint, params, controller.signal)
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
