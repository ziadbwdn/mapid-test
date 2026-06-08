import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CostHistogram from '@/features/dashboard/CostHistogram'

const mockData = [
  { cost_range: '< $10', product_count: 5, avg_cost: 8 },
  { cost_range: '$100 - $499', product_count: 20, avg_cost: 250 },
]

function renderComponent() {
  return render(<MemoryRouter><CostHistogram /></MemoryRouter>)
}

describe('CostHistogram', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows loading skeleton initially', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Promise(() => {}) as any)
    const { container } = renderComponent()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders chart heading with data and opens info modal', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: mockData })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByText('Cost Distribution')).toBeInTheDocument())
    fireEvent.click(screen.getByTitle('Info'))
    expect(screen.getByText(/Distribusi biaya produk/)).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Gagal fetch'))
    renderComponent()
    await waitFor(() => expect(screen.getByText('Gagal fetch')).toBeInTheDocument())
  })

  it('shows empty state when no data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: [] })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByText('No cost distribution data')).toBeInTheDocument())
  })
})
