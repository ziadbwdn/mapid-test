import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState message="No data available" />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders an icon', () => {
    const { container } = render(<EmptyState message="Empty" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
