interface MapLegendProps {
  legend: { label: string; color: string }[]
}

export default function MapLegend({ legend }: MapLegendProps) {
  if (legend.length === 0) return null

  return (
    <div className="absolute left-6 bottom-6 z-40 map-glass rounded-xl shadow-lg border border-surface-border px-4 py-3 pointer-events-auto">
      <p className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
        Categories
      </p>
      <div className="flex flex-col gap-1.5">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-sans text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
