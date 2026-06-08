import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SegmentChart from '@/features/dashboard/SegmentChart'

const mockData = [
  { dimension_value: 'High-Performer', product_count: 10, total_revenue: 50000, color_code: '#10b981' },
  { dimension_value: 'Mid-Range', product_count: 5, total_revenue: 10000, color_code: '#f59e0b' },
]

function renderComponent() {
  return render(<MemoryRouter><SegmentChart /></MemoryRouter>)
}

describe('SegmentChart', () => {
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
    await waitFor(() => expect(screen.getByText('Segment Distribution')).toBeInTheDocument())
    fireEvent.click(screen.getByTitle('Info'))
    expect(screen.getByText(/proporsi produk berdasarkan segmen/)).toBeInTheDocument()
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
    await waitFor(() => expect(screen.getByText('No segment data')).toBeInTheDocument())
  })
})
