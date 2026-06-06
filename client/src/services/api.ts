import type { ApiResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function buildQueryString(params?: Record<string, string | number | undefined>): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.set(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchApi<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}${buildQueryString(params)}`
  const res = await fetch(url, { signal })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.error?.message || `HTTP ${res.status}: ${res.statusText}`
    throw new Error(message)
  }

  return res.json()
}
