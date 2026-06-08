import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, KPICardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

describe('Skeleton', () => {
  it('renders base skeleton with default classes', () => {
    const { container } = render(<Skeleton />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('animate-pulse')
    expect(div.className).toContain('bg-gray-200')
    expect(div.className).toContain('rounded')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('h-8')
    expect(div.className).toContain('w-32')
  })
})

describe('KPICardSkeleton', () => {
  it('renders with two skeleton children', () => {
    const { container } = render(<KPICardSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(2)
  })
})

describe('ChartSkeleton', () => {
  it('renders with default height', () => {
    const { container } = render(<ChartSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(2)
  })

  it('accepts custom height', () => {
    render(<ChartSkeleton height={500} />)
  })
})

describe('TableSkeleton', () => {
  it('renders 5 skeleton rows plus header', () => {
    const { container } = render(<TableSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(5)
  })
})
