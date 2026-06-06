import { useState, useCallback } from 'react'

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setTotal: (total: number) => void
  next: () => void
  prev: () => void
}

export function usePagination(
  initialPage: number = 1,
  initialLimit: number = 10,
): PaginationState {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages))
  }, [totalPages])

  const prev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  return { page, limit, total, totalPages, setPage, setLimit, setTotal, next, prev }
}
