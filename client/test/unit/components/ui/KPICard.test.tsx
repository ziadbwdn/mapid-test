import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICard } from '@/components/ui/KPICard'

describe('KPICard', () => {
  it('renders title and value', () => {
    render(<KPICard title="Total Products" value="150" />)
    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders up trend', () => {
    render(<KPICard title="Sales" value="100" trend={{ direction: 'up', value: '12%' }} />)
    expect(screen.getByText('12%')).toBeInTheDocument()
  })

  it('renders down trend', () => {
    render(<KPICard title="Sales" value="100" trend={{ direction: 'down', value: '5%' }} />)
    expect(screen.getByText('5%')).toBeInTheDocument()
  })

  it('renders progress bar when progress is provided', () => {
    const { container } = render(<KPICard title="Test" value="50" progress={75} />)
    const progressBar = container.querySelector('[style*="width: 75%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('clamps progress to 100%', () => {
    const { container } = render(<KPICard title="Test" value="50" progress={150} />)
    const progressBar = container.querySelector('[style*="width: 100%"]')
    expect(progressBar).toBeInTheDocument()
  })
})
