import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { BoxplotResponse } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import {
  ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Scatter, Customized
} from 'recharts'

const CATEGORIES = ['Accessories', 'Bikes', 'Clothing']
const TIERS = ['Low Cost (<$100)', 'Mid Cost ($100-$800)', 'High Cost (>$800)']

const TICK_LABELS: Record<number, string> = {
  1: 'Accessories',
  5: 'Bikes',
  9: 'Clothing',
}

function BoxPlotRenderer(props: any) {
  const { xAxisMap, yAxisMap, data } = props
  const xAxis = Object.values(xAxisMap)[0] as any
  const yAxis = Object.values(yAxisMap)[0] as any

  if (!xAxis || !yAxis || !data || data.length === 0) return null

  const bottom10 = data[0]?.bottom_10 || []
  const boxWidth = 28

  return (
    <g>
      {/* Box plots: whiskers + IQR box + median + fliers */}
      {data.map((d: any, i: number) => {
        const cx = xAxis.scale(d.x)
        const boxTop = yAxis.scale(d.q3)
        const boxBottom = yAxis.scale(d.q1)
        const medianY = yAxis.scale(d.median)
        const whiskerTop = yAxis.scale(d.whisker_max)
        const whiskerBottom = yAxis.scale(d.whisker_min)

        return (
          <g key={`box-${i}`}>
            {/* Whisker line */}
            <line
              x1={cx}
              y1={whiskerTop}
              x2={cx}
              y2={whiskerBottom}
              stroke="#555"
              strokeWidth={1.5}
            />
            {/* Top whisker cap */}
            <line
              x1={cx - 10}
              y1={whiskerTop}
              x2={cx + 10}
              y2={whiskerTop}
              stroke="#555"
              strokeWidth={1.5}
            />
            {/* Bottom whisker cap */}
            <line
              x1={cx - 10}
              y1={whiskerBottom}
              x2={cx + 10}
              y2={whiskerBottom}
              stroke="#555"
              strokeWidth={1.5}
            />
            {/* IQR Box */}
            <rect
              x={cx - boxWidth / 2}
              y={boxTop}
              width={boxWidth}
              height={Math.max(1, boxBottom - boxTop)}
              fill={d.tier_color}
              opacity={0.7}
              stroke="#555"
              strokeWidth={1.5}
              rx={2}
            />
            {/* Median line */}
            <line
              x1={cx - boxWidth / 2}
              y1={medianY}
              x2={cx + boxWidth / 2}
              y2={medianY}
              stroke="white"
              strokeWidth={2}
            />
            {/* Fliers */}
            {d.fliers.map((f: any, fi: number) => (
              <circle
                key={fi}
                cx={cx}
                cy={yAxis.scale(f.total_profit)}
                r={3}
                fill={d.tier_color}
                stroke="#555"
                strokeWidth={0.5}
              />
            ))}
          </g>
        )
      })}

      {/* Bottom-10 overlay (red dots) — render last so they sit on top */}
      {bottom10.map((b: any, bi: number) => {
        const group = data.find(
          (d: any) => d.category === b.category && d.cost_tier === b.cost_tier
        )
        if (!group) return null
        const cx = xAxis.scale(group.x)
        return (
          <circle
            key={`bt-${bi}`}
            cx={cx}
            cy={yAxis.scale(b.total_profit)}
            r={6}
            fill="red"
            stroke="black"
            strokeWidth={1.5}
          />
        )
      })}
    </g>
  )
}

export default function CostVsProfitBoxplot() {
  const { data, loading, error, refetch } = useApiData<BoxplotResponse>('/analytics/boxplot-data')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton height={400} />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.groups.length === 0) return <EmptyState message="No box plot data" />

  const chartData = data.groups.map((g) => {
    const catIndex = CATEGORIES.indexOf(g.category)
    const tierIndex = TIERS.indexOf(g.cost_tier)
    const x = catIndex * 4 + tierIndex
    return { ...g, x, bottom_10: data.bottom_10 }
  })

  const allValues = chartData.flatMap(d => [d.whisker_min, d.whisker_max, ...d.fliers.map(f => f.total_profit)])
  const dataMax = Math.max(...allValues, 1)
  const yMax = Math.ceil(dataMax * 1.1 / 1000) * 1000

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">
          Total Profit Distribution by Category & Cost Tier
          <br />
          <span className="text-sm font-normal text-on-surface-variant">
            (Identifying Maintenance Candidates)
          </span>
        </h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#66c2a5' }} />
          <span>Low Cost (&lt;$100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#fc8d62' }} />
          <span>Mid Cost ($100-$800)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#8da0cb' }} />
          <span>High Cost (&gt;$800)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-black" />
          <span>Bottom 10 (Maintenance Hitlist)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={550}>
          <ComposedChart
            data={chartData}
            margin={{ top: 40, right: 30, bottom: 50, left: 80 }}
          >
          <XAxis
            type="number"
            dataKey="x"
            domain={[-1, 11]}
            ticks={[1, 5, 9]}
            tickFormatter={(v: number) => TICK_LABELS[v] || ''}
            label={{
              value: 'Product Category',
              position: 'bottom',
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            domain={[0, yMax]}
            label={{
              value: 'Total Profit ($)',
              angle: -90,
              position: 'insideLeft',
              fontSize: 12,
            }}
          />
          <Tooltip
            formatter={(_value: number, _name: string, props: any) => {
              const p = props?.payload
              if (!p) return ['', '']
              return [
                `Q1: ${p.q1.toFixed(0)} | Median: ${p.median.toFixed(0)} | Q3: ${p.q3.toFixed(0)}`,
                `${p.category} — ${p.cost_tier}`,
              ]
            }}
          />
          {/* Invisible scatter to enable tooltip hover detection */}
          <Scatter dataKey="median" fill="transparent" stroke="transparent" />
          <Customized component={BoxPlotRenderer} />
        </ComposedChart>
      </ResponsiveContainer>

      <ChartInfoModal
        open={infoOpen}
        title="Total Profit Distribution by Category & Cost Tier"
        onClose={() => setInfoOpen(false)}
      >
        <div className="space-y-3">
          <p>
            Box plot showing profit distribution across product categories and cost tiers.
            The box spans Q1–Q3 (IQR), the line inside is the median, and whiskers extend
            to the most extreme data point within 1.5×IQR.
          </p>
          <p>
            <span className="font-semibold text-secondary">🔴 Red dots</span> indicate the
            bottom-10 maintenance hitlist products overlaid on their respective category &amp; tier.
          </p>
          <p>
            <span className="font-semibold text-secondary">📊 Statistical fliers</span> are
            small dots beyond the whiskers — products with unusually high or low total profit
            relative to their group.
          </p>
        </div>
      </ChartInfoModal>
    </div>
  )
}
