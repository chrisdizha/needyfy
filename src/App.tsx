import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "./contexts/AuthContext";
import { SecurityProvider } from "./contexts/SecurityContext";

import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookingDashboard from "./pages/BookingDashboard";
import ProviderBookingDashboard from "./pages/ProviderBookingDashboard";
import ListEquipment from "./pages/ListEquipment";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/Categories";
import Pricing from "./pages/Pricing";
import SuccessStories from "./pages/SuccessStories";
import PromotionsAndDiscounts from "./pages/PromotionsAndDiscounts";
import ProviderResources from "./pages/ProviderResources";
import ProviderGuidelines from "./pages/ProviderGuidelines";
import ProviderFAQ from "./pages/ProviderFAQ";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancelled from "./pages/BookingCancelled";
import CookieConsent from "./components/layout/CookieConsent";

import Reviews from "./pages/Reviews";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/booking-dashboard" element={<BookingDashboard />} />
                  <Route path="/provider-booking-dashboard" element={<ProviderBookingDashboard />} />
                  <Route path="/list-equipment" element={<ListEquipment />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/promotions-and-discounts" element={<PromotionsAndDiscounts />} />
                  <Route path="/provider-resources" element={<ProviderResources />} />
                  <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
                  <Route path="/provider-faq" element={<ProviderFAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
                  <Route path="/booking-cancelled" element={<BookingCancelled />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
