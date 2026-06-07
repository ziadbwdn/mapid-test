import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { ProfitByCategory as ProfitByCategoryType } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCompactCurrency } from '@/utils/formatters'

const CATEGORY_COLORS: Record<string, string> = {
  Accessories: '#3b82f6',
  Bikes: '#10b981',
  Clothing: '#f59e0b',
}

export default function ProfitByCategory() {
  const { data, loading, error, refetch } = useApiData<ProfitByCategoryType[]>('/analytics/profit-by-category')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No profit data" />

  const chartData = data.map((d) => ({
    ...d,
    total_profit: Number(d.total_profit),
    total_profit_fmt: formatCompactCurrency(d.total_profit),
  }))

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Total Profit by Category</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: 70 }}>
          <XAxis dataKey="category_name" tick={{ fontSize: 12 }} label={{ value: 'Category', position: 'bottom', fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
            label={{ value: 'Total Profit ($)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
          <Bar dataKey="total_profit" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.category_name] || '#00668a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Total Profit by Category" onClose={() => setInfoOpen(false)}>
        <p>Menampilkan total keuntungan bersih per kategori. Membantu mengidentifikasi kategori mana yang paling berkontribusi terhadap profitabilitas keseluruhan.</p>
      </ChartInfoModal>
    </div>
  )
}
