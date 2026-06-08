import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiData } from '@/hooks/useApiData'

describe('useApiData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with loading state', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)

    const { result } = renderHook(() => useApiData('/test'))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns null state when endpoint is null', () => {
    const { result } = renderHook(() => useApiData(null))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches and returns data', async () => {
    const responseData = { success: true, data: [{ id: 1 }], meta: { page: 1, limit: 10, total: 1, total_pages: 1 } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData)
    } as Response)

    const { result } = renderHook(() => useApiData('/products'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 1 }])
    expect(result.current.meta).toEqual({ page: 1, limit: 10, total: 1, total_pages: 1 })
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useApiData('/test'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network error')
  })

  it('handles non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.resolve({ error: { message: 'Internal error' } })
    } as Response)

    const { result } = renderHook(() => useApiData('/test'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Internal error')
  })

  it('refetch triggers new request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    const { result } = renderHook(() => useApiData('/test'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    act(() => { result.current.refetch() })
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))
  })
})
