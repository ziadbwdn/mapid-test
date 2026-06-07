import { useApiData } from '@/hooks/useApiData'
import type { CostDistribution } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function CostHistogram() {
  const { data, loading, error, refetch } = useApiData<CostDistribution[]>('/analytics/cost-distribution')

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No cost distribution data" />

  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.product_count)) : 1

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <h3 className="font-headline-lg text-lg font-bold text-primary mb-4">Cost Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%" barGap={4}>
          <XAxis dataKey="cost_range" tick={{ fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, Math.ceil(maxCount * 1.15)]} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <Tooltip />
          <Bar dataKey="product_count" fill="#00668a" radius={[4, 4, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
