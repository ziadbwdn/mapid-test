import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { CostDistribution } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function CostHistogram() {
  const { data, loading, error, refetch } = useApiData<CostDistribution[]>('/analytics/cost-distribution')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No cost distribution data" />

  const chartData = data.map(d => ({
    ...d,
    product_count: Number(d.product_count),
    avg_cost: Number(d.avg_cost),
  }))

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((d) => d.product_count)) : 1

  const totalProducts = chartData.reduce((sum, d) => sum + d.product_count, 0)
  const weightedMean = totalProducts > 0
    ? chartData.reduce((sum, d) => sum + d.product_count * d.avg_cost, 0) / totalProducts
    : 0

  // Determine which bin label the mean falls into for the reference line
  const meanBin = chartData.find((d) => {
    const range = d.cost_range
    if (range === '< $10') return weightedMean < 10
    if (range === '$10 - $99') return weightedMean >= 10 && weightedMean < 100
    if (range === '$100 - $499') return weightedMean >= 100 && weightedMean < 500
    if (range === '$500 - $999') return weightedMean >= 500 && weightedMean < 1000
    if (range === '≥ $1000') return weightedMean >= 1000
    return false
  })

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Cost Distribution</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="20%" barGap={4} margin={{ top: 10, right: 20, bottom: 40, left: 70 }}>
          <XAxis dataKey="cost_range" tick={{ fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} label={{ value: 'Cost ($)', position: 'bottom', fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, Math.ceil(maxCount * 1.15)]}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={(props: any) => {
              const { x = -35, y = 0 } = props?.viewBox || {}
              return (
                <text x={x} y={y} textAnchor="middle" fontSize={11} fill="#6b7280" transform={`rotate(-90, ${x}, ${y})`}>
                  <tspan x={x} dy={-8}>Frequency</tspan>
                  <tspan x={x} dy={16}>(Number of Products)</tspan>
                </text>
              )
            }}
          />
          <Tooltip />
          <Bar dataKey="product_count" fill="#00668a" radius={[4, 4, 0, 0]} maxBarSize={60} />
          {meanBin && (
            <ReferenceLine x={meanBin.cost_range} stroke="red" strokeDasharray="4 4" label="Mean Cost" />
          )}
        </BarChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Cost Distribution" onClose={() => setInfoOpen(false)}>
        <p>Distribusi biaya produk dalam rentang tertentu (histogram). Membantu memahami konsentrasi harga produk dan mengidentifikasi range cost yang paling umum.</p>
      </ChartInfoModal>
    </div>
  )
}
