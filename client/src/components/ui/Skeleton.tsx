import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
}

export function KPICardSkeleton() {
  return (
    <div className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-border">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-border">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="w-full" style={{ height: height - 80 }} />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-border overflow-hidden">
      <div className="p-6 border-b border-surface-border">
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-surface-border flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}
