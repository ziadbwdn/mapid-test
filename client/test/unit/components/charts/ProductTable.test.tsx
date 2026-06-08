import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductTable from '@/features/dashboard/ProductTable'

const mockProducts = [
  { id: '1', product_key: 101, product_name: 'Bike A', category: 'Bikes', sub_category: 'Frames', segment: 'High-Performer', segment_color: '#10b981', cost: 500, avg_selling_price: 1200, avg_order_revenue: 1200, avg_monthly_revenue: 6000, total_orders: 100, total_revenue: 120000, total_quantity: 150, total_customers: 80, last_sale_date: '2024-06-01', recency: 10, time_span: 365, health_score: 85, health_status: 'Healthy', latitude: -6.2, longitude: 106.8, profit_per_unit: 700, total_profit: 105000, profit_margin_pct: 58.33, sales_velocity: 0.41 },
]

const mockResponse = {
  success: true, data: mockProducts,
  meta: { page: 1, limit: 10, total: 1, total_pages: 1 }
}

function renderProductTable() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ProductTable />
    </MemoryRouter>
  )
}

describe('ProductTable', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows loading skeleton initially', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)
    const { container } = renderProductTable()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table with products and health status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve(mockResponse)
    } as Response)
    renderProductTable()
    await waitFor(() => expect(screen.getByText('Bike A')).toBeInTheDocument())
    expect(screen.getByText((c) => c.startsWith('Healthy'))).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Gagal load produk'))
    renderProductTable()
    await waitFor(() => expect(screen.getByText('Gagal load produk')).toBeInTheDocument())
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })
})
