import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders brand name', () => {
    renderNavbar()
    expect(screen.getByText('GeoAnalytix')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    renderNavbar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Map View')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('links have correct href attributes', () => {
    renderNavbar()
    const homeLink = screen.getByText('Home').closest('a')
    const mapLink = screen.getByText('Map View').closest('a')
    const dashLink = screen.getByText('Dashboard').closest('a')

    expect(homeLink).toHaveAttribute('href', '/')
    expect(mapLink).toHaveAttribute('href', '/map')
    expect(dashLink).toHaveAttribute('href', '/dashboard')
  })

  it('shows mobile menu toggle button', () => {
    renderNavbar()
    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders without crashing on different paths', () => {
    renderNavbar('/map')
    expect(screen.getByText('Map View')).toBeInTheDocument()
  })

  it('toggles mobile menu on button click', () => {
    renderNavbar()
    const toggleBtn = document.querySelector('button')
    expect(toggleBtn).toBeInTheDocument()

    expect(screen.queryByText('Map View')).toBeInTheDocument()
    fireEvent.click(toggleBtn!)
    const dashLinks = screen.getAllByText('Dashboard')
    expect(dashLinks.length).toBe(2)
  })

  it('closes mobile menu when a link is clicked', () => {
    renderNavbar()
    const toggleBtn = document.querySelector('button')!
    fireEvent.click(toggleBtn)

    const mobileMapLink = screen.getAllByText('Map View')[1]
    fireEvent.click(mobileMapLink)
    const dashLinks = screen.queryAllByText('Dashboard')
    expect(dashLinks.length).toBe(1)
  })
})
