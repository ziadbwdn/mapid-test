import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-600 mb-4 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-secondary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-on-secondary-container transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}
