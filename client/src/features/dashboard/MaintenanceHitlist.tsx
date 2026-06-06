import { useApiData } from '@/hooks/useApiData'
import type { HitlistItem } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCompactCurrency } from '@/utils/formatters'

export default function MaintenanceHitlist() {
  const { data, loading, error, refetch } = useApiData<HitlistItem[]>('/analytics/maintenance-hitlist')

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No maintenance data" />

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <h3 className="font-headline-lg text-lg font-bold text-primary mb-4">Maintenance Hitlist (Bottom 10)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="product_name" width={180} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
          <Bar dataKey="total_profit" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
