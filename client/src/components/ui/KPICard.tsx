import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  icon?: ReactNode
  progress?: number
}

export function KPICard({ title, value, trend, icon, progress }: KPICardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            {title}
          </span>
          {icon && <span className="text-on-surface-variant">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-stat-kpi text-3xl font-bold tracking-tight text-primary">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold font-label-sm flex items-center gap-0.5 ${
                trend.direction === 'up' ? 'text-data-positive' : 'text-data-negative'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
      {progress !== undefined && (
        <div className="h-1 bg-surface-container-high rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-secondary-container rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
