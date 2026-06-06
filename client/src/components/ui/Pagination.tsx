import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="px-6 py-4 bg-surface-container-low border-t border-surface-border flex items-center justify-between">
      <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
        Showing {startItem}-{endItem} of {total}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 bg-surface-container-lowest border border-surface-border rounded hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer border ${
              p === page
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-lowest border-surface-border text-on-surface hover:bg-surface transition-colors'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 bg-surface-container-lowest border border-surface-border rounded hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
