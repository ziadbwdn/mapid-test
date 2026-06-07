import { useState } from 'react'
import { useApiData } from '@/hooks/useApiData'
import type { HitlistItem } from '@/types'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartInfoButton, ChartInfoModal } from '@/components/ui/ChartInfoModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCompactCurrency } from '@/utils/formatters'

export default function MaintenanceHitlist() {
  const { data, loading, error, refetch } = useApiData<HitlistItem[]>('/analytics/maintenance-hitlist')
  const [infoOpen, setInfoOpen] = useState(false)

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data || data.length === 0) return <EmptyState message="No maintenance data" />

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-lg text-lg font-bold text-primary">Maintenance Hitlist (Bottom 10)</h3>
        <ChartInfoButton onClick={() => setInfoOpen(true)} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: 'Total Profit (IDR)', position: 'bottom', fontSize: 11 }}
          />
          <YAxis type="category" dataKey="product_name" width={180} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
          <Bar dataKey="total_profit" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <ChartInfoModal open={infoOpen} title="Maintenance Hitlist" onClose={() => setInfoOpen(false)}>
        <div className="space-y-3">
          <p className="font-semibold text-secondary">🔴 Zero / negative profit</p>
          <p>Profit nol atau negatif = penghancur profit. Setiap unit terjual menghasilkan rugi bersih setelah biaya diperhitungkan.</p>

          <p className="font-semibold text-secondary">📋 Triage tool</p>
          <p>Bukan penghukuman. Keputusan yang perlu diambil: discontinue, reprice, reformulate, atau terima sebagai loss-leader strategis.</p>

          <p className="font-semibold text-secondary">🎨 Pola kategori</p>
          <p>Jika banyak produk dari kategori sama masuk daftar ini, sinyal masalah sistemik (strategi harga, struktur biaya, atau supplier) — bukan kegagalan SKU individual.</p>

          <p className="font-semibold text-secondary">📊 Profit vs margin</p>
          <p>Total profit rendah belum tentu margin rendah; bisa jadi volume hampir nol. Cross-check dengan Health Quadrant untuk diagnosis tepat.</p>

          <p className="font-semibold text-secondary">⚡ Urutan aksi rekomendasi</p>
          <p>1) Cek posisi di BCG. 2) Dog = prioritas discontinue. 3) Niche/Workhorse = intervensi velocity/margin. Hindari keputusan prematur tanpa cross-analysis.</p>

          <p className="font-semibold text-secondary">⚠️ Ilusi revenue</p>
          <p>Revenue tinggi bisa menutupi profit negatif. Pola "busy but bleeding" — produk terlihat laris tapi sebenarnya merugi.</p>
        </div>
      </ChartInfoModal>
    </div>
  )
}
