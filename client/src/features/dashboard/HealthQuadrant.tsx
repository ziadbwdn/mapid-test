import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { HealthQuadrant as HealthQuadrantType } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, Legend,
} from 'recharts'

const QUADRANT_COLORS: Record<string, string> = {
  Star: '#10b981',
  Workhorse: '#3b82f6',
  Niche: '#f59e0b',
  Dog: '#ef4444',
}

export default function HealthQuadrant() {
  const { data, loading, error, refetch } = useApiData<HealthQuadrantType[]>('/analytics/health-quadrant')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton height={350} />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No health quadrant data" />

  const grouped = data.reduce<Record<string, HealthQuadrantType[]>>((acc, item) => {
    const q = item.quadrant || 'Niche'
    if (!acc[q]) acc[q] = []
    acc[q].push(item)
    return acc
  }, {})

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Health Quadrant (BCG Matrix)</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
          <XAxis
            dataKey="sales_velocity"
            name="Sales Velocity"
            tick={{ fontSize: 11 }}
            label={{ value: 'Sales Velocity', position: 'bottom', fontSize: 11 }}
          />
          <YAxis
            dataKey="profit_margin_pct"
            name="Profit Margin %"
            tick={{ fontSize: 11 }}
            label={{ value: 'Profit Margin %', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <ZAxis range={[50, 120]} />
          <Tooltip />
          <Legend />
          {Object.entries(grouped).map(([quadrant, items]) => (
            <Scatter
              key={quadrant}
              name={quadrant}
              data={items}
              fill={QUADRANT_COLORS[quadrant] || '#6b7280'}
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Health Quadrant (BCG Matrix)" onClose={() => setInfoOpen(false)}>
        <div className="space-y-3">
          <p className="font-semibold text-secondary">⭐ Stars — top-right</p>
          <p>High volume + high margin = mesin pertumbuhan. Prioritaskan ketersediaan stok, marketing spend, dan relasi supplier.</p>

          <p className="font-semibold text-secondary">🐎 Workhorses — bottom-right</p>
          <p>High volume + low margin = masalah harga/biaya. Renegosiasi supplier, kenaikan harga selektif, atau bundling dengan item margin tinggi.</p>

          <p className="font-semibold text-secondary">💎 Niche gems — top-left</p>
          <p>Low volume + high margin = profit tersembunyi. Pertimbangkan promosi target untuk geser ke Star; jika tidak, tetap sebagai SKU premium.</p>

          <p className="font-semibold text-secondary">🔻 Dogs — bottom-left</p>
          <p>Low volume + low margin = kandidat diskontinu. Menghabiskan modal dan rak tanpa return.</p>

          <p className="font-semibold text-secondary">💡 Bubble size</p>
          <p>Ukuran bubble = total profit. Besar di Workhorse = efek volume; kecil di Star = peluang skala.</p>

          <p className="font-semibold text-secondary">🎯 Rekomendasi</p>
          <p>Fokus pada produk di dekat garis median. Intervensi kecil (price adjustment, promotion) bisa menggeser kuadran klasifikasinya.</p>
        </div>
      </ChartInfoModal>
    </div>
  )
}
