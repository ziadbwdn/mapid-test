import { useApiData } from '@/hooks/useApiData'
import type { ProfitByCategory as ProfitByCategoryType } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCompactCurrency } from '@/utils/formatters'

export default function ProfitByCategory() {
  const { data, loading, error, refetch } = useApiData<ProfitByCategoryType[]>('/analytics/profit-by-category')

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No profit data" />

  const chartData = data.map((d) => ({
    ...d,
    total_profit_fmt: formatCompactCurrency(d.total_profit),
  }))

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <h3 className="font-headline-lg text-lg font-bold text-primary mb-4">Total Profit by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="category_name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
          <Bar dataKey="total_profit" fill="#00668a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
