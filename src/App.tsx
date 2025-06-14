import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import BookingDashboard from "./pages/BookingDashboard";
import ListEquipment from "./pages/ListEquipment";
import ProviderResources from "./pages/ProviderResources";
import ProviderGuidelines from "./pages/ProviderGuidelines";
import SuccessStories from "./pages/SuccessStories";
import ProviderFAQ from "./pages/ProviderFAQ";
import Categories from "./pages/Categories";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancelled from "./pages/BookingCancelled";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderBookingDashboard from "./pages/ProviderBookingDashboard";
import PromotionsAndDiscounts from "./pages/PromotionsAndDiscounts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/bookings" element={<BookingDashboard />} />
          <Route path="/list-equipment" element={<ListEquipment />} />
          <Route path="/provider-resources" element={<ProviderResources />} />
          <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/provider-faq" element={<ProviderFAQ />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/booking-cancelled" element={<BookingCancelled />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/provider-bookings" element={<ProviderBookingDashboard />} />
          <Route path="/promotions-discounts" element={<PromotionsAndDiscounts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
