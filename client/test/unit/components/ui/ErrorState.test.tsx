import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from '@/components/ui/ErrorState'

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders retry button when onRetry provided', () => {
    render(<ErrorState message="Error" onRetry={() => {}} />)
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('calls onRetry when button clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Error" onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Coba Lagi'))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorState message="Error" />)
    expect(screen.queryByText('Coba Lagi')).not.toBeInTheDocument()
  })
})
