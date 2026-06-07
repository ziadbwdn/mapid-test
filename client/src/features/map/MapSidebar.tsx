import { useState } from 'react'
import {
  Search,
  Play,
  Ruler,
  CircleDot,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Trash2,
} from 'lucide-react'

interface MapSidebarProps {
  category: string
  segment: string
  search: string
  categories: string[]
  totalPins?: number
  legend: { label: string; color: string }[]
  categoryCounts: Record<string, number>
  isCollapsed: boolean
  onToggleCollapse: () => void
  rulerActive: boolean
  bufferActive: boolean
  bufferRadiusKm: number
  hasBufferResult: boolean
  onCategoryChange: (val: string) => void
  onSegmentChange: (val: string) => void
  onSearchChange: (val: string) => void
  onRulerToggle: () => void
  onBufferToggle: () => void
  onBufferRadiusChange: (val: number) => void
  onClearBuffer: () => void
}

const SEGMENTS = ['High-Performer', 'Mid-Range', 'Low-Performer']

export default function MapSidebar({
  category,
  segment,
  search,
  categories,
  totalPins = 0,
  legend,
  categoryCounts,
  isCollapsed,
  onToggleCollapse,
  rulerActive,
  bufferActive,
  bufferRadiusKm,
  hasBufferResult,
  onCategoryChange,
  onSegmentChange,
  onSearchChange,
  onRulerToggle,
  onBufferToggle,
  onBufferRadiusChange,
  onClearBuffer,
}: MapSidebarProps) {
  const [openSection, setOpenSection] = useState<'analysis' | 'layer' | null>('analysis')

  if (isCollapsed) {
    return (
      <aside className="absolute left-4 top-4 bottom-4 z-40 flex flex-col pointer-events-none">
        <div className="map-glass rounded-2xl shadow-lg border border-surface-border p-2 flex flex-col gap-3 pointer-events-auto bg-white/90 backdrop-blur-md">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
            title="Expand panel"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setOpenSection('analysis')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${openSection === 'analysis' ? 'bg-secondary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
            title="Analysis"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setOpenSection('layer')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${openSection === 'layer' ? 'bg-secondary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
            title="Layer"
          >
            <CircleDot className="w-5 h-5" />
          </button>
        </div>
      </aside>
    )
  }

  const toggleSection = (section: 'analysis' | 'layer') => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <aside className="absolute left-4 top-4 bottom-4 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Header */}
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border p-5 flex items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-md flex-shrink-0">
        <div>
          <h2 className="font-headline-lg text-xl font-bold text-primary">Explorer</h2>
          <p className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Map Explorer Panel
          </p>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
          title="Collapse panel"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable mid section */}
      <div className="flex-1 min-h-0 overflow-y-auto pointer-events-auto scrollbar-thin space-y-4">

      {/* Accordion: Analysis */}
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border pointer-events-auto bg-white/90 backdrop-blur-md">
        <button
          onClick={() => toggleSection('analysis')}
          className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container/50 transition-colors"
        >
          <span className="font-headline-lg text-sm font-bold text-primary">Analysis</span>
          <ChevronDown
            className={`w-4 h-4 text-on-surface-variant transition-transform ${openSection === 'analysis' ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection === 'analysis' && (
          <div className="px-5 pb-5 space-y-5">
            {/* Search */}
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

            {/* Category */}
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

            {/* Segment */}
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

            {/* Tools */}
            <div className="space-y-2">
              <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                Tools
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onRulerToggle}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-label-sm font-semibold transition-all cursor-pointer ${
                    rulerActive
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-surface-border text-on-surface-variant hover:border-secondary hover:text-secondary bg-white shadow-sm'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Ruler
                </button>
                <button
                  onClick={onBufferToggle}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-label-sm font-semibold transition-all cursor-pointer ${
                    bufferActive
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-surface-border text-on-surface-variant hover:border-secondary hover:text-secondary bg-white shadow-sm'
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5" />
                  Buffer
                </button>
              </div>
            </div>

            {/* Buffer radius slider */}
            {bufferActive && (
              <div className="space-y-2 pt-2 border-t border-surface-border">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                    Radius
                  </label>
                  <span className="text-xs font-mono-data text-primary">{bufferRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={bufferRadiusKm}
                  onChange={(e) => onBufferRadiusChange(parseInt(e.target.value, 10))}
                  className="w-full accent-secondary cursor-pointer"
                />
              </div>
            )}

            {/* Clear buffer */}
            {hasBufferResult && (
              <button
                onClick={onClearBuffer}
                className="w-full flex items-center justify-center gap-2 text-center text-xs font-sans text-on-surface-variant hover:text-red-600 cursor-pointer border border-transparent hover:border-red-200 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Buffer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Accordion: Layer */}
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border overflow-hidden pointer-events-auto bg-white/90 backdrop-blur-md">
        <button
          onClick={() => toggleSection('layer')}
          className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container/50 transition-colors"
        >
          <span className="font-headline-lg text-sm font-bold text-primary">Layer</span>
          <ChevronDown
            className={`w-4 h-4 text-on-surface-variant transition-transform ${openSection === 'layer' ? 'rotate-180' : ''}`}
          />
        </button>
        {openSection === 'layer' && (
          <div className="px-5 pb-5">
            <p className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Categories
            </p>
            {legend.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70">No categories visible</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {legend.map((item) => {
                  const count = categoryCounts[item.label] ?? 0
                  return (
                    <div key={item.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-sans text-on-surface-variant">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono-data text-on-surface-variant/60 bg-surface-container-low px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      </div>{/* End scrollable mid section */}

      {/* Active Points mini-card */}
      <div className="map-glass rounded-2xl shadow-lg border border-surface-border p-4 flex items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-md flex-shrink-0">
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
