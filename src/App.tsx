import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { useReactValidation } from "@/hooks/useReactValidation";
import { OptimizedAuthProvider } from "@/contexts/OptimizedAuthContext";
import OptimizedErrorBoundary from "@/components/performance/OptimizedErrorBoundary";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import SkipToContent from "@/components/accessibility/SkipToContent";
import {
  LazyPublicHome,
  LazyLogin,
  LazyRegister,
  LazyNotFound,
  LazyCategories,
  LazyHowItWorks,
  LazyPricing,
  LazyBlog,
  LazyRewards,
  LazyListEquipment,
  LazyEquipment,
  LazyEquipmentDetails,
 } from "@/components/routing/LazyRoutes";

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

// Simple Home component
const Home = () => {
  console.log('🏠 Home component rendering...');
  return <LazyPublicHome />;
};

// App wrapper with React validation
const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  useReactValidation();
  return <>{children}</>;
};

function App() {
  console.log('🔍 App component rendering...');
  
  return (
    <OptimizedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <OptimizedAuthProvider>
            <AppWrapper>
              <SkipToContent />
              <Router>
                <Suspense fallback={<LoadingFallback />}>
                  <main id="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<LazyLogin />} />
                      <Route path="/register" element={<LazyRegister />} />
                      <Route path="/categories" element={<LazyCategories />} />
                      <Route path="/how-it-works" element={<LazyHowItWorks />} />
                      <Route path="/pricing" element={<LazyPricing />} />
                      <Route path="/blog" element={<LazyBlog />} />
                      <Route 
                        path="/rewards" 
                        element={
                          <ProtectedRoute>
                            <LazyRewards />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/list-equipment" element={<LazyListEquipment />} />
                      <Route path="/equipment" element={<LazyEquipment />} />
                      <Route path="/equipment/:id" element={<LazyEquipmentDetails />} />
                      <Route path="*" element={<LazyNotFound />} />
                    </Routes>
                  </main>
                </Suspense>
              </Router>
              <Toaster />
            </AppWrapper>
          </OptimizedAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </OptimizedErrorBoundary>
  );
}

export default App;
