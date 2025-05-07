
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import BookingDashboard from "./pages/BookingDashboard";
import ListEquipment from "./pages/ListEquipment";
import ProviderResources from "./pages/ProviderResources";
import ProviderGuidelines from "./pages/ProviderGuidelines";
import SuccessStories from "./pages/SuccessStories";
import ProviderFAQ from "./pages/ProviderFAQ";

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
          <Route path="/bookings" element={<BookingDashboard />} />
          <Route path="/list-equipment" element={<ListEquipment />} />
          <Route path="/provider-resources" element={<ProviderResources />} />
          <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/provider-faq" element={<ProviderFAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
