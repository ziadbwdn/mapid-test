import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import DashboardPage from '@/features/dashboard/DashboardPage'

describe('App smoke', () => {
  it('renders without crashing and shows brand', () => {
    render(<App />)
    expect(screen.getAllByText('GeoAnalytix').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Geospatial Intelligence Platform')).toBeInTheDocument()
  })
})

describe('Page routing', () => {
  it('renders Home content', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText('Geospatial Intelligence Platform')).toBeInTheDocument()
  })

  it('renders Dashboard page', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument()
  })

  it('renders 404 page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })
})
