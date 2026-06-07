import { X, Lightbulb } from 'lucide-react'

interface ChartInfoModalProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export function ChartInfoModal({ open, title, children, onClose }: ChartInfoModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-border w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary" />
            <h3 className="font-headline-lg text-base font-bold text-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 text-sm leading-relaxed text-on-surface space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ChartInfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
      title="Info"
      aria-label="Chart information"
    >
      <Lightbulb className="w-4 h-4" />
    </button>
  )
}
