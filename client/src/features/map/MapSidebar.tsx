import { Search, Play } from 'lucide-react'

interface MapSidebarProps {
  category: string
  segment: string
  search: string
  categories: string[]
  totalPins?: number
  onCategoryChange: (val: string) => void
  onSegmentChange: (val: string) => void
  onSearchChange: (val: string) => void
  onRunAnalysis?: () => void
  onReset?: () => void
}

const SEGMENTS = ['High-Performer', 'Mid-Range', 'Low-Performer']

export default function MapSidebar({
  category,
  segment,
  search,
  categories,
  totalPins = 0,
  onCategoryChange,
  onSegmentChange,
  onSearchChange,
  onRunAnalysis,
  onReset,
}: MapSidebarProps) {
  return (
    <aside className="absolute left-6 top-6 bottom-6 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border p-6 flex flex-col gap-6 pointer-events-auto bg-white/90 backdrop-blur-md">
        <div>
          <h2 className="font-headline-lg text-xl font-bold text-primary mb-1">Explorer</h2>
          <p className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Spatial Analysis Console
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Search Product
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Sport-100 Helmet"
                className="w-full pl-10 pr-4 py-2 bg-white border border-surface-border rounded-lg text-sm font-sans focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface shadow-sm"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-on-surface-variant w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Category
            </label>
            <select
              className="w-full px-4 py-2 bg-white border border-surface-border rounded-lg text-sm font-sans focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer shadow-sm text-on-surface"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              Product Segment
            </label>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg}
                  onClick={() => onSegmentChange(segment === seg ? '' : seg)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-label-sm font-semibold transition-all cursor-pointer ${
                    segment === seg
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-surface-border text-on-surface-variant hover:border-secondary hover:text-secondary bg-white shadow-sm'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(onRunAnalysis || onReset) && (
          <div className="pt-4 border-t border-surface-border flex flex-col gap-2">
            {onRunAnalysis && (
              <button
                onClick={onRunAnalysis}
                className="w-full bg-secondary hover:bg-on-secondary-container text-white py-3 rounded-lg font-sans font-semibold text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Run Spatial Analysis
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="w-full text-center text-xs font-sans text-on-surface-variant hover:text-secondary cursor-pointer border border-transparent hover:border-surface-border py-1.5 rounded-md transition-colors"
              >
                Reset Simulation Points
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats mini-card */}
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border p-4 flex items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-md">
        <div>
          <p className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Active Points
          </p>
          <p className="font-stat-kpi text-3xl font-bold text-primary tracking-tight">
            {totalPins.toLocaleString()}
          </p>
        </div>
        <div className="w-24 h-12 bg-surface-container-low rounded-lg overflow-hidden relative border border-surface-border/50 shadow-inner">
          <div className="absolute inset-0 flex items-end px-2 gap-1.5">
            {SEGMENTS.map((seg) => (
              <div
                key={seg}
                className={`flex-1 rounded-t transition-all duration-300 ${
                  seg === 'High-Performer' ? 'bg-secondary' : seg === 'Mid-Range' ? 'bg-secondary-container' : 'bg-secondary/60'
                }`}
                style={{ height: segment === seg ? '80%' : segment === '' ? `${50 + SEGMENTS.indexOf(seg) * 10}%` : '25%' }}
                title={seg}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
