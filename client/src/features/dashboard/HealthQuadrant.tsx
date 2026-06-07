import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { HealthQuadrant as HealthQuadrantType } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, Legend, ReferenceLine, Customized, CartesianGrid,
} from 'recharts'

const QUADRANT_COLORS: Record<string, string> = {
  Star: '#10b981',
  Workhorse: '#3b82f6',
  Niche: '#f59e0b',
  Dog: '#ef4444',
}

function ThinGridAndLabels(props: any) {
  const { xAxisMap, yAxisMap, data } = props
  const xAxis = Object.values(xAxisMap)[0] as any
  const yAxis = Object.values(yAxisMap)[0] as any

  if (!xAxis || !yAxis || !data || data.length === 0) return null

  const velocities = data.map((d: any) => d.sales_velocity).sort((a: number, b: number) => a - b)
  const margins = data.map((d: any) => d.profit_margin_pct).sort((a: number, b: number) => a - b)
  const n = velocities.length
  const medianVelocity = n % 2 === 0
    ? (velocities[n / 2 - 1] + velocities[n / 2]) / 2
    : velocities[Math.floor(n / 2)]
  const medianMargin = n % 2 === 0
    ? (margins[n / 2 - 1] + margins[n / 2]) / 2
    : margins[Math.floor(n / 2)]

  const xScale = xAxis.scale
  const xDomain = typeof xScale?.domain === 'function' ? xScale.domain() : null
  const xMin = xDomain
    ? (xDomain[0] < 0 ? xDomain[1] * 0.02 : xDomain[0] * 0.98)
    : Math.min(...data.map((d: any) => d.sales_velocity)) * 0.95

  return (
    <g>
      {/* Thinner grid for 0-10 zone on X-axis */}
      {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
        <line key={`thin-x-${v}`} x1={xScale(v)} y1={yAxis.scale(0)} x2={xScale(v)} y2={yAxis.scale(10)} stroke="#ccc" strokeWidth={0.5} strokeDasharray="2 2" />
      ))}
      {/* Thinner grid for 0-10 zone on Y-axis */}
      {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
        <line key={`thin-y-${v}`} x1={xScale(0)} y1={yAxis.scale(v)} x2={xScale(10)} y2={yAxis.scale(v)} stroke="#ccc" strokeWidth={0.5} strokeDasharray="2 2" />
      ))}
      {/* Quadrant labels */}
      <text x={xScale(xMin)} y={yAxis.scale(medianMargin * 1.02)} fill="gray" fontSize={10} textAnchor="start" dy={-2}>💎 Niche</text>
      <text x={xScale(medianVelocity * 1.02)} y={yAxis.scale(medianMargin * 1.02)} fill="gray" fontSize={10} textAnchor="start" dy={-2}>⭐ Star</text>
      <text x={xScale(xMin)} y={yAxis.scale(medianMargin * 0.98)} fill="gray" fontSize={10} textAnchor="start" dy={12}>🔻 Dog</text>
      <text x={xScale(medianVelocity * 1.02)} y={yAxis.scale(medianMargin * 0.98)} fill="gray" fontSize={10} textAnchor="start" dy={12}>🐎 Workhorse</text>
    </g>
  )
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

  const velocities = data.map(d => d.sales_velocity).sort((a, b) => a - b)
  const margins = data.map(d => d.profit_margin_pct).sort((a, b) => a - b)
  const medianVelocity = velocities.length % 2 === 0
    ? (velocities[velocities.length / 2 - 1] + velocities[velocities.length / 2]) / 2
    : velocities[Math.floor(velocities.length / 2)]
  const medianMargin = margins.length % 2 === 0
    ? (margins[margins.length / 2 - 1] + margins[margins.length / 2]) / 2
    : margins[Math.floor(margins.length / 2)]

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Health Quadrant (BCG Matrix)</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 160, bottom: 50, left: 60 }}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis
            dataKey="sales_velocity"
            name="Sales Velocity"
            type="number"
            domain={[0, 400]}
            ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400]}
            tick={{ fontSize: 11 }}
            label={{ value: 'Sales Velocity (Units Sold / Time Period)', position: 'bottom', fontSize: 11 }}
          />
          <YAxis
            dataKey="profit_margin_pct"
            name="Profit Margin %"
            type="number"
            domain={[0, 80]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80]}
            tick={{ fontSize: 11 }}
            label={{ value: 'Profit Margin (%)', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <ZAxis range={[20, 80]} />
          <Tooltip />
          <Legend verticalAlign="top" align="right" layout="vertical" wrapperStyle={{ paddingLeft: 20 }} />
          <ReferenceLine x={medianVelocity} stroke="gray" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={medianMargin} stroke="gray" strokeDasharray="4 4" strokeOpacity={0.6} />
          {Object.entries(grouped).map(([quadrant, items]) => (
            <Scatter
              key={quadrant}
              name={quadrant}
              data={items}
              fill={QUADRANT_COLORS[quadrant] || '#6b7280'}
              shape="circle"
              opacity={0.8}
            />
          ))}
          <Customized component={ThinGridAndLabels} />
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
