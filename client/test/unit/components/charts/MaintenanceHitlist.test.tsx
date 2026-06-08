import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MaintenanceHitlist from '@/features/dashboard/MaintenanceHitlist'

const mockData = [
  { product_name: 'Product A', category: 'Bikes', total_profit: -500, profit_margin_pct: -5 },
  { product_name: 'Product B', category: 'Accessories', total_profit: -200, profit_margin_pct: -2 },
]

function renderComponent() {
  return render(<MemoryRouter><MaintenanceHitlist /></MemoryRouter>)
}

describe('MaintenanceHitlist', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows loading skeleton initially', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)
    const { container } = renderComponent()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders chart heading with data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: mockData })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByText('Maintenance Hitlist (Bottom 10)')).toBeInTheDocument())
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Gagal'))
    renderComponent()
    await waitFor(() => expect(screen.getByText('Gagal')).toBeInTheDocument())
  })

  it('shows empty state when no data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: [] })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByText('No maintenance data')).toBeInTheDocument())
  })
})
