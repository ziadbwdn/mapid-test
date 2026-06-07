import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { CategoryData } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CategoryChart() {
  const { data, loading, error, refetch } = useApiData<CategoryData[]>('/analytics/category')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No category data" />

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Category Distribution</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%" barGap={4}>
          <XAxis dataKey="dimension_value" tick={{ fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={{ value: 'Product Count', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip />
          <Bar dataKey="product_count" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color_code} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Category Distribution" onClose={() => setInfoOpen(false)}>
        <p>Menampilkan komposisi jumlah produk per kategori. Membantu memahami struktur portofolio produk dan mana kategori yang mendominasi.</p>
      </ChartInfoModal>
    </div>
  )
}
