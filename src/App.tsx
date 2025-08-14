
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OptimizedAuthProvider } from '@/contexts/OptimizedAuthContext'
import { SecurityProvider } from '@/components/security/SecurityProvider'
import { Toaster } from '@/components/ui/sonner'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { SecureRoute } from '@/components/auth/SecureRoute'
import Index from '@/pages/Index'
import Categories from '@/pages/Categories'
import ListEquipment from '@/pages/ListEquipment'
import PublicHome from '@/pages/PublicHome'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import EquipmentDetails from '@/pages/EquipmentDetails'
import BookingSuccess from '@/pages/BookingSuccess'
import Equipment from '@/pages/Equipment'
import EditEquipment from '@/pages/EditEquipment'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import CookiePolicy from '@/pages/CookiePolicy'
import Blog from '@/pages/Blog'
import HowItWorks from '@/pages/HowItWorks'
import Pricing from '@/pages/Pricing'
import Rewards from '@/pages/Rewards'
import ResetPassword from '@/pages/ResetPassword'
import NotFound from '@/pages/NotFound'
import Contact from '@/pages/Contact'
import RenterSafety from '@/pages/RenterSafety'
import BookingHelp from '@/pages/BookingHelp'
import RenterFAQ from '@/pages/RenterFAQ'
import ProviderResources from '@/pages/ProviderResources'
import ProviderGuidelines from '@/pages/ProviderGuidelines'
import ProviderFAQ from '@/pages/ProviderFAQ'
import SuccessStories from '@/pages/SuccessStories'

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
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:category" element={<Categories />} />
                    <Route path="/search" element={<PublicHome />} />
                    <Route path="/equipment" element={<PublicHome />} />
                    <Route path="/auth" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/booking-confirmation/:sessionId" element={<BookingSuccess />} />
                    <Route path="/help" element={<Terms />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* For Renters Pages */}
                    <Route path="/renter-safety" element={<RenterSafety />} />
                    <Route path="/booking-help" element={<BookingHelp />} />
                    <Route path="/renter-faq" element={<RenterFAQ />} />
                    
                    {/* For Providers Pages */}
                    <Route path="/provider-resources" element={<ProviderResources />} />
                    <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
                    <Route path="/provider-faq" element={<ProviderFAQ />} />
                    <Route path="/success-stories" element={<SuccessStories />} />
                    
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
