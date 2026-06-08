import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '@/components/ui/Pagination'

describe('Pagination', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} limit={10} onPageChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page buttons and info text', () => {
    render(
      <Pagination page={2} totalPages={5} total={50} limit={10} onPageChange={vi.fn()} />
    )
    expect(screen.getByText(/Showing 11-20 of 50/)).toBeInTheDocument()
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument()
    }
  })

  it('disables prev button on first page', () => {
    render(
      <Pagination page={1} totalPages={5} total={50} limit={10} onPageChange={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0]
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <Pagination page={5} totalPages={5} total={50} limit={10} onPageChange={vi.fn()} />
    )
    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[buttons.length - 1]
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange when page button clicked', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination page={2} totalPages={5} total={50} limit={10} onPageChange={onPageChange} />
    )
    fireEvent.click(screen.getByText('4'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with page-1 on prev click', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination page={3} totalPages={5} total={50} limit={10} onPageChange={onPageChange} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page+1 on next click', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination page={3} totalPages={5} total={50} limit={10} onPageChange={onPageChange} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(onPageChange).toHaveBeenCalledWith(4)
  })
})
