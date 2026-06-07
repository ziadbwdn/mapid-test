import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { ProfitByCategory as ProfitByCategoryType } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCompactCurrency } from '@/utils/formatters'

export default function ProfitByCategory() {
  const { data, loading, error, refetch } = useApiData<ProfitByCategoryType[]>('/analytics/profit-by-category')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No profit data" />

  const chartData = data.map((d) => ({
    ...d,
    total_profit_fmt: formatCompactCurrency(d.total_profit),
  }))

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Total Profit by Category</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="category_name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
            label={{ value: 'Total Profit (IDR)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
          <Bar dataKey="total_profit" fill="#00668a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Total Profit by Category" onClose={() => setInfoOpen(false)}>
        <p>Menampilkan total keuntungan bersih per kategori. Membantu mengidentifikasi kategori mana yang paling berkontribusi terhadap profitabilitas keseluruhan.</p>
      </ChartInfoModal>
    </div>
  )
}
