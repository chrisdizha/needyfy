
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { OptimizedAuthProvider, useAuth } from "@/contexts/OptimizedAuthContext";
import { ConsolidatedSecurityProvider } from "@/components/security/ConsolidatedSecurityProvider";
import { EnhancedSecurityProvider } from "@/components/security/EnhancedSecurityProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import OptimizedErrorBoundary from "@/components/performance/OptimizedErrorBoundary";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { SecureRoute } from "@/components/auth/SecureRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import {
  LazyPublicHome,
  LazyAuthenticatedHome,
  LazyLogin,
  LazyRegister,
  LazyProfile,
  LazyAdmin,
  LazyEquipment,
  LazyNewEquipment,
  LazyEditEquipment,
  LazyEquipmentDetails,
  LazyNewReport,
  LazyReportDetails,
  LazyEditReport,
  LazyNewDispute,
  LazyDisputeDetails,
  LazyEditDispute,
  LazyForgotPassword,
  LazyResetPassword,
  LazyTerms,
  LazyPrivacy,
  LazyContact,
  LazyAbout,
  LazyNotFound,
  LazyDashboard,
  LazyCategories
} from "@/components/routing/LazyRoutes";
import "@/lib/i18n";

// Optimized QueryClient with better cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Optimized Home component
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return user ? <LazyAuthenticatedHome /> : <LazyPublicHome />;
};

// Security headers hook component
const SecurityHeadersProvider = ({ children }: { children: React.ReactNode }) => {
  useSecurityHeaders();
  return <>{children}</>;
};

function App() {
  return (
    <OptimizedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <OptimizedAuthProvider>
            <AnalyticsProvider>
              <ConsolidatedSecurityProvider>
                <EnhancedSecurityProvider>
                  <SecurityHeadersProvider>
                  <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LazyLogin />} />
                  <Route path="/register" element={<LazyRegister />} />
                  <Route path="/forgot-password" element={<LazyForgotPassword />} />
                  <Route path="/reset-password" element={<LazyResetPassword />} />
                  <Route path="/terms" element={<LazyTerms />} />
                  <Route path="/privacy" element={<LazyPrivacy />} />
                  <Route path="/contact" element={<LazyContact />} />
                  <Route path="/about" element={<LazyAbout />} />
                  <Route path="/categories" element={<LazyCategories />} />
                  <Route path="/equipment" element={<LazyEquipment />} />
                  <Route path="/equipment/:id" element={<LazyEquipmentDetails />} />
                  <Route
                    path="/dashboard"
                    element={
                      <SecureRoute>
                        <LazyDashboard />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <SecureRoute>
                        <LazyProfile />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <LazyAdmin />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/equipment/new"
                    element={
                      <SecureRoute>
                        <LazyNewEquipment />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/equipment/:id/edit"
                    element={
                      <SecureRoute>
                        <LazyEditEquipment />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/reports/new"
                    element={
                      <SecureRoute>
                        <LazyNewReport />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/reports/:id"
                    element={
                      <SecureRoute>
                        <LazyReportDetails />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/reports/:id/edit"
                    element={
                      <SecureRoute>
                        <LazyEditReport />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/disputes/new"
                    element={
                      <SecureRoute>
                        <LazyNewDispute />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/disputes/:id"
                    element={
                      <SecureRoute>
                        <LazyDisputeDetails />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/disputes/:id/edit"
                    element={
                      <SecureRoute>
                        <LazyEditDispute />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <SecureRoute>
                        <LazyDashboard />
                      </SecureRoute>
                    }
                  />
                  <Route
                    path="/list-equipment"
                    element={
                      <SecureRoute>
                        <LazyNewEquipment />
                      </SecureRoute>
                    }
                  />
                  <Route path="*" element={<LazyNotFound />} />
                  </Routes>
                </Suspense>
                  </Router>
                  <Toaster />
                  </SecurityHeadersProvider>
                </EnhancedSecurityProvider>
              </ConsolidatedSecurityProvider>
            </AnalyticsProvider>
          </OptimizedAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </OptimizedErrorBoundary>
  );
}

export default App;
