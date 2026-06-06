import { Package } from 'lucide-react'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Package className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  )
}
