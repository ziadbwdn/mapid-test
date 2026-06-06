import { Globe, Database, Share2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-surface-border">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-headline-lg text-lg font-bold text-primary select-none">
            GeoAnalytix
          </span>
          <p className="text-xs text-on-surface-variant font-sans opacity-80">
            &copy; 2026 GeoAnalytix. All rights reserved.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-md cursor-pointer" title="Regions">
            <Globe className="w-4 h-4" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-md cursor-pointer" title="Database">
            <Database className="w-4 h-4" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-md cursor-pointer" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}
