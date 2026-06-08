import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfitByCategory from '@/features/dashboard/ProfitByCategory'

const mockData = [
  { category_name: 'Bikes', total_profit: 50000, product_count: 10 },
  { category_name: 'Accessories', total_profit: 15000, product_count: 5 },
]

function renderComponent() {
  return render(<MemoryRouter><ProfitByCategory /></MemoryRouter>)
}

describe('ProfitByCategory', () => {
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
    await waitFor(() => expect(screen.getByText('Total Profit by Category')).toBeInTheDocument())
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
    await waitFor(() => expect(screen.getByText('No profit data')).toBeInTheDocument())
  })
})
