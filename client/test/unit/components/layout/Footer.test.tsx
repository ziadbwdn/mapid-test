import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />)
    expect(screen.getByText('GeoAnalytix')).toBeInTheDocument()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/2026 GeoAnalytix/)).toBeInTheDocument()
  })

  it('renders action buttons with titles', () => {
    render(<Footer />)
    expect(screen.getByTitle('Regions')).toBeInTheDocument()
    expect(screen.getByTitle('Database')).toBeInTheDocument()
    expect(screen.getByTitle('Share')).toBeInTheDocument()
  })

  it('renders SVG icons', () => {
    const { container } = render(<Footer />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(3)
  })
})
