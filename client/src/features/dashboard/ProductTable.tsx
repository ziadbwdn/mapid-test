import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ArrowUpDown } from 'lucide-react'
import { useApiData } from '@/hooks/useApiData'
import { useDebounce } from '@/hooks/useDebounce'
import type { Product } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCompactCurrency, formatNumber } from '@/utils/formatters'

type SortField = 'product_name' | 'total_revenue' | 'total_orders' | 'cost' | 'health_score'

export default function ProductTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const sortBy = (searchParams.get('sort_by') || 'product_name') as SortField
  const sortOrder = (searchParams.get('sort_order') || 'asc') as 'asc' | 'desc'
  const searchRaw = searchParams.get('search') || ''
  const search = useDebounce(searchRaw, 300)

  const setParam = useCallback(
    (key: string, val: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (val) {
          next.set(key, val)
        } else {
          next.delete(key)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const params: Record<string, string | number> = {
    page,
    limit: 10,
    sort_by: sortBy,
    sort_order: sortOrder,
  }
  if (search) params.search = search

  const { data: products, meta, loading, error, refetch } = useApiData<Product[]>('/products', params)

  const handleSort = (field: SortField) => {
    const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('sort_by', field)
      next.set('sort_order', nextOrder)
      next.set('page', '1')
      return next
    })
  }

  const sortIndicator = (field: SortField) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-30" />
    return <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
  }

  if (loading) return <TableSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!products) return <EmptyState message="No product data" />

  const total = meta?.total ?? products.length
  const totalPages = meta?.total_pages ?? Math.max(1, Math.ceil(total / 10))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-border overflow-hidden">
      <div className="px-6 py-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Products</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 bg-surface-container-low border border-surface-border rounded-lg text-sm font-sans focus:ring-secondary focus:border-secondary outline-none text-on-surface placeholder:text-on-surface-variant/60 shadow-sm"
            value={searchRaw}
            onChange={(e) => setParam('search', e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-on-surface-variant w-4 h-4" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-surface-container-low select-none">
            <tr>
              {([
                { key: 'product_name' as SortField, label: 'Product Name' },
                { key: 'total_revenue' as SortField, label: 'Revenue' },
                { key: 'total_orders' as SortField, label: 'Orders' },
                { key: 'cost' as SortField, label: 'Cost' },
                { key: 'health_score' as SortField, label: 'Health' },
              ]).map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                  No products match current filters.
                </td>
              </tr>
            ) : (
              products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-6 py-4 text-primary font-medium">{p.product_name}</td>
                  <td className="px-6 py-4 font-mono-data text-xs text-on-surface">
                    {formatCompactCurrency(p.total_revenue)}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{formatNumber(p.total_orders)}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{formatCompactCurrency(p.cost)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        p.health_status === 'Healthy'
                          ? 'bg-data-positive/10 text-data-positive'
                          : p.health_status === 'At Risk'
                            ? 'bg-map-accent/10 text-map-accent'
                            : 'bg-data-negative/10 text-data-negative'
                      }`}
                    >
                      {p.health_status} ({p.health_score})
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={10}
        onPageChange={(p) => setParam('page', String(p))}
      />
    </div>
  )
}
