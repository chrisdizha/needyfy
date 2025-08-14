
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
import CategoryPage from '@/pages/CategoryPage'
import ListEquipmentPage from '@/pages/ListEquipmentPage'
import SearchPage from '@/pages/SearchPage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import EquipmentDetailsPage from '@/pages/EquipmentDetailsPage'
import BookingConfirmationPage from '@/pages/BookingConfirmationPage'
import MyEquipmentPage from '@/pages/MyEquipmentPage'
import EditEquipmentPage from '@/pages/EditEquipmentPage'
import MyBookingsPage from '@/pages/MyBookingsPage'
import MessagesPage from '@/pages/MessagesPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import HelpPage from '@/pages/HelpPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import SecurityPage from '@/pages/SecurityPage'
import EarningsPage from '@/pages/EarningsPage'
import ReportsPage from '@/pages/ReportsPage'
import DisputesPage from '@/pages/DisputesPage'
import NotFoundPage from '@/pages/NotFoundPage'

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
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
                    <Route path="/booking-confirmation/:sessionId" element={<BookingConfirmationPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<SecureRoute><DashboardPage /></SecureRoute>} />
                    <Route path="/list-equipment" element={<SecureRoute><ListEquipmentPage /></SecureRoute>} />
                    <Route path="/my-equipment" element={<SecureRoute><MyEquipmentPage /></SecureRoute>} />
                    <Route path="/edit-equipment/:id" element={<SecureRoute><EditEquipmentPage /></SecureRoute>} />
                    <Route path="/my-bookings" element={<SecureRoute><MyBookingsPage /></SecureRoute>} />
                    <Route path="/messages" element={<SecureRoute><MessagesPage /></SecureRoute>} />
                    <Route path="/profile" element={<SecureRoute><ProfilePage /></SecureRoute>} />
                    <Route path="/earnings" element={<SecureRoute><EarningsPage /></SecureRoute>} />
                    <Route path="/reports" element={<SecureRoute><ReportsPage /></SecureRoute>} />
                    <Route path="/disputes" element={<SecureRoute><DisputesPage /></SecureRoute>} />
                    <Route path="/security" element={<SecureRoute><SecurityPage /></SecureRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<NotFoundPage />} />
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
