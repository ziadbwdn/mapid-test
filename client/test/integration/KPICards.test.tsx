import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import KPICards from '@/features/dashboard/KPICards'

const mockKPI = {
  success: true,
  data: {
    total_products: 100,
    total_revenue: 5000000,
    total_orders: 2500,
    total_quantity_sold: 15000,
    total_customers: 800,
    avg_product_cost: 150,
    avg_monthly_revenue: 400000,
    healthy_products: 60,
    at_risk_products: 25,
    critical_products: 15
  }
}

function renderKPICards() {
  return render(
    <MemoryRouter>
      <KPICards />
    </MemoryRouter>
  )
}

describe('KPICards', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading skeletons initially', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)

    renderKPICards()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders KPI cards after loading', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockKPI)
    } as Response)

    renderKPICards()
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Orders')).toBeInTheDocument()
    expect(screen.getByText('Avg Product Cost')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('API unavailable'))

    renderKPICards()
    await waitFor(() => {
      expect(screen.getByText('API unavailable')).toBeInTheDocument()
    })
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('returns null when no KPI data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: null })
    } as Response)

    const { container } = renderKPICards()
    await waitFor(() => {
      expect(container.querySelector('.grid')).toBeNull()
    })
  })
})
