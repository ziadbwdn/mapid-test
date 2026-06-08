import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

describe('usePagination', () => {
  it('initializes with defaults', () => {
    const { result } = renderHook(() => usePagination())
    expect(result.current.page).toBe(1)
    expect(result.current.limit).toBe(10)
    expect(result.current.total).toBe(0)
    expect(result.current.totalPages).toBe(1)
  })

  it('computes totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => { result.current.setTotal(25) })
    expect(result.current.totalPages).toBe(3)
  })

  it('next() increments page', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => { result.current.setTotal(50) })
    act(() => { result.current.next() })
    expect(result.current.page).toBe(2)
  })

  it('next() does not exceed totalPages', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => { result.current.setTotal(5) })
    act(() => { result.current.next() })
    expect(result.current.page).toBe(1)
  })

  it('prev() decrements page', () => {
    const { result } = renderHook(() => usePagination(3, 10))
    act(() => { result.current.setTotal(50) })
    act(() => { result.current.prev() })
    expect(result.current.page).toBe(2)
  })

  it('prev() does not go below 1', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => { result.current.prev() })
    expect(result.current.page).toBe(1)
  })

  it('setPage works', () => {
    const { result } = renderHook(() => usePagination(1, 10))
    act(() => { result.current.setTotal(50) })
    act(() => { result.current.setPage(3) })
    expect(result.current.page).toBe(3)
  })

  it('setLimit resets page to 1', () => {
    const { result } = renderHook(() => usePagination(3, 10))
    act(() => { result.current.setLimit(20) })
    expect(result.current.limit).toBe(20)
    expect(result.current.page).toBe(3)
  })
})
