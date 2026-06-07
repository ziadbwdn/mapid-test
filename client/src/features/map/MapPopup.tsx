import { X } from 'lucide-react'
import { motion } from 'motion/react'
import type { GeoJSONFeature } from '@/types'

interface MapPopupProps {
  feature: GeoJSONFeature
  x: number
  y: number
  onClose: () => void
}

export default function MapPopup({ feature, x, y, onClose }: MapPopupProps) {
  const p = feature.properties

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute map-glass px-4 py-2.5 rounded-xl border border-secondary shadow-lg pointer-events-auto z-50 min-w-44 select-none"
      style={{ left: x, top: y, transform: 'translateX(-50%) translateY(-118%)' }}
    >
      <div className="flex justify-between items-start">
        <p className="font-label-sm text-xs font-bold text-secondary tracking-wide uppercase">
          {p.product_name}
        </p>
        <button
          onClick={onClose}
          className="p-0.5 ml-2 hover:bg-surface-container-high rounded-full cursor-pointer text-on-surface-variant hover:text-primary"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="mt-1 flex flex-col gap-0.5">
        <p className="text-xs text-on-surface-variant">{p.category}</p>
        <p className="font-mono-data text-xs text-on-surface">
          Revenue: ${(p.total_revenue ?? 0).toLocaleString()}
        </p>
        <span
          className={`text-[10px] font-bold mt-0.5 ${
            p.health_status === 'Healthy'
              ? 'text-data-positive'
              : p.health_status === 'At Risk'
                ? 'text-map-accent'
                : 'text-data-negative'
          }`}
        >
          {p.health_status} ({p.health_score})
        </span>
      </div>
    </motion.div>
  )
}
