
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OptimizedAuthProvider } from '@/contexts/OptimizedAuthContext'
import { SecurityProvider } from '@/components/security/SecurityProvider'
import { Toaster } from '@/components/ui/sonner'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { SecureRoute } from '@/components/auth/SecureRoute'
import Index from '@/pages/Index'
import Categories from '@/pages/Categories'
import ListEquipment from '@/pages/ListEquipment'
import PublicHome from '@/pages/PublicHome'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import EquipmentDetails from '@/pages/EquipmentDetails'
import BookingSuccess from '@/pages/BookingSuccess'
import Equipment from '@/pages/Equipment'
import EditEquipment from '@/pages/EditEquipment'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OptimizedAuthProvider>
        <SecurityProvider>
          <AnalyticsProvider>
            <Router>
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/category/:category" element={<Categories />} />
                    <Route path="/search" element={<PublicHome />} />
                    <Route path="/auth" element={<Login />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/booking-confirmation/:sessionId" element={<BookingSuccess />} />
                    <Route path="/help" element={<Terms />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/list-equipment" element={<SecureRoute><ListEquipment /></SecureRoute>} />
                    <Route path="/my-equipment" element={<SecureRoute><Equipment /></SecureRoute>} />
                    <Route path="/edit-equipment/:id" element={<SecureRoute><EditEquipment /></SecureRoute>} />
                    <Route path="/my-bookings" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/messages" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/profile" element={<SecureRoute><Profile /></SecureRoute>} />
                    <Route path="/earnings" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/reports" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/disputes" element={<SecureRoute><Dashboard /></SecureRoute>} />
                    <Route path="/security" element={<SecureRoute><Profile /></SecureRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </Router>
          </AnalyticsProvider>
        </SecurityProvider>
      </OptimizedAuthProvider>
    </QueryClientProvider>
  )
}

export default App
