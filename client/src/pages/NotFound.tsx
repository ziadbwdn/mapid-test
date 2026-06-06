import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h1 className="font-headline-lg text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-on-surface-variant text-lg mb-8 font-sans">Page not found</p>
      <Link
        to="/"
        className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-on-secondary-container transition-colors"
      >
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  )
}
