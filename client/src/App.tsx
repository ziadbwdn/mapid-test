import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import MapPage from '@/features/map/MapPage'
import DashboardPage from '@/features/dashboard/DashboardPage'

function AppContent() {
  const location = useLocation()
  const hideFooter = location.pathname === '/map'

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
