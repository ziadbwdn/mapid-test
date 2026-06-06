import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { useApiData } from '@/hooks/useApiData'
import type { KPIData } from '@/types'
import { KPICard } from '@/components/ui/KPICard'
import { KPICardSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatCompactCurrency, formatNumber } from '@/utils/formatters'

export default function KPICards() {
  const { data: kpi, loading, error, refetch } = useApiData<KPIData>('/kpi')

  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <section className="mb-10">
        <ErrorState message={error} onRetry={refetch} />
      </section>
    )
  }

  if (!kpi) return null

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <KPICard
        title="Total Products"
        value={formatNumber(kpi.total_products)}
        icon={<Package className="w-4 h-4" />}
        progress={100}
      />
      <KPICard
        title="Total Revenue"
        value={formatCompactCurrency(kpi.total_revenue)}
        icon={<DollarSign className="w-4 h-4" />}
        progress={kpi.total_products > 0 ? Math.min(kpi.total_revenue / (kpi.total_products * 10000) * 100, 100) : 0}
      />
      <KPICard
        title="Total Orders"
        value={formatNumber(kpi.total_orders)}
        icon={<ShoppingCart className="w-4 h-4" />}
        progress={kpi.total_products > 0 ? Math.min(kpi.total_orders / (kpi.total_products * 500) * 100, 100) : 0}
      />
      <KPICard
        title="Avg Product Cost"
        value={formatCompactCurrency(kpi.avg_product_cost)}
        icon={<TrendingUp className="w-4 h-4" />}
        progress={65}
      />
    </section>
  )
}
