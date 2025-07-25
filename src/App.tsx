
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { EnhancedSecurityProvider } from "./components/security/EnhancedSecurityProvider";
import { SecureErrorBoundary } from "./components/security/SecureErrorBoundary";

import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ListEquipment from "./pages/ListEquipment";
import BookingDashboard from "./pages/BookingDashboard";
import ProviderBookingDashboard from "./pages/ProviderBookingDashboard";
import Onboarding from "./pages/Onboarding";
import Categories from "./pages/Categories";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import SuccessStories from "./pages/SuccessStories";
import PromotionsAndDiscounts from "./pages/PromotionsAndDiscounts";
import ProviderGuidelines from "./pages/ProviderGuidelines";
import ProviderFAQ from "./pages/ProviderFAQ";
import ProviderResources from "./pages/ProviderResources";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancelled from "./pages/BookingCancelled";
import { CookieConsent } from "./components/security/CookieConsent";

import Reviews from "./pages/Reviews";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <SecureErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <EnhancedSecurityProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/list-equipment" element={<ListEquipment />} />
                  <Route path="/booking-dashboard" element={<BookingDashboard />} />
                  <Route path="/provider-booking-dashboard" element={<ProviderBookingDashboard />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/promotions-and-discounts" element={<PromotionsAndDiscounts />} />
                  <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
                  <Route path="/provider-faq" element={<ProviderFAQ />} />
                  <Route path="/provider-resources" element={<ProviderResources />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
                  <Route path="/booking-cancelled" element={<BookingCancelled />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieConsent />
                <Toaster />
              </BrowserRouter>
            </EnhancedSecurityProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SecureErrorBoundary>
  );
}

export default App;
