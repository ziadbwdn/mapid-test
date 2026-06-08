import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CategoryChart from '@/features/dashboard/CategoryChart'

const mockData = [
  { dimension_value: 'Bikes', product_count: 10, total_revenue: 50000, color_code: '#10b981' },
  { dimension_value: 'Accessories', product_count: 5, total_revenue: 10000, color_code: '#3b82f6' },
]

function renderComponent() {
  return render(<MemoryRouter><CategoryChart /></MemoryRouter>)
}

describe('CategoryChart', () => {
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
    await waitFor(() => expect(screen.getByText('Category Distribution')).toBeInTheDocument())
    expect(screen.getByTitle('Info')).toBeInTheDocument()
  })

  it('opens info modal on info button click', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: mockData })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByTitle('Info')).toBeInTheDocument())
    fireEvent.click(screen.getByTitle('Info'))
    expect(screen.getByText(/komposisi jumlah produk/)).toBeInTheDocument()
  })

  it('shows error state on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Gagal ambil data'))
    renderComponent()
    await waitFor(() => expect(screen.getByText('Gagal ambil data')).toBeInTheDocument())
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('shows empty state when data is empty array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: () => Promise.resolve({ success: true, data: [] })
    } as Response)
    renderComponent()
    await waitFor(() => expect(screen.getByText('No category data')).toBeInTheDocument())
  })
})
