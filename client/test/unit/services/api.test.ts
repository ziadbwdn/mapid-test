import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchApi } from '@/services/api'

describe('fetchApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches data successfully', async () => {
    const responseData = { success: true, data: { id: 1 } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData)
    } as Response)

    const result = await fetchApi('/test')
    expect(result).toEqual(responseData)
  })

  it('builds query string from params', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    await fetchApi('/products', { page: 1, limit: 10, search: 'bike' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
    expect(url).toContain('search=bike')
  })

  it('omits undefined params from query string', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    await fetchApi('/test', { page: 1, sort_by: undefined })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('page=1')
    expect(url).not.toContain('sort_by')
  })

  it('omits empty string params', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    await fetchApi('/test', { search: '' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).not.toContain('search=')
  })

  it('does not append query string when no params', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    await fetchApi('/test')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).not.toContain('?')
  })

  it('throws on non-ok response with error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ error: { message: 'Not found' } })
    } as Response)

    await expect(fetchApi('/missing')).rejects.toThrow('Not found')
  })

  it('throws generic HTTP error when no JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse error'))
    } as Response)

    await expect(fetchApi('/error')).rejects.toThrow('HTTP 500: Internal Server Error')
  })

  it('passes abort signal to fetch', async () => {
    const controller = new AbortController()
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: null })
    } as Response)

    await fetchApi('/test', undefined, controller.signal)
    const options = mockFetch.mock.calls[0][1] as RequestInit
    expect(options.signal).toBe(controller.signal)
  })
})
