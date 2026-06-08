import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartInfoModal, ChartInfoButton } from '@/components/ui/ChartInfoModal'

describe('ChartInfoModal', () => {
  it('returns null when open is false', () => {
    const { container } = render(
      <ChartInfoModal open={false} title="Test" onClose={vi.fn()}>
        <p>Content</p>
      </ChartInfoModal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders modal with title and children when open', () => {
    render(
      <ChartInfoModal open={true} title="Test Modal" onClose={vi.fn()}>
        <p>Modal content here</p>
      </ChartInfoModal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content here')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    const { container } = render(
      <ChartInfoModal open={true} title="Test" onClose={onClose}>
        <p>Content</p>
      </ChartInfoModal>
    )
    const backdrop = container.firstChild as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when inner content clicked', () => {
    const onClose = vi.fn()
    render(
      <ChartInfoModal open={true} title="Test" onClose={onClose}>
        <p>Content</p>
      </ChartInfoModal>
    )
    fireEvent.click(screen.getByText('Content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <ChartInfoModal open={true} title="Test" onClose={onClose}>
        <p>Content</p>
      </ChartInfoModal>
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('ChartInfoButton', () => {
  it('renders and calls onClick', () => {
    const onClick = vi.fn()
    render(<ChartInfoButton onClick={onClick} />)
    const btn = screen.getByTitle('Info')
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })
})
