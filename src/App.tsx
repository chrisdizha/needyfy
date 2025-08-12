
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { useReactValidation } from "@/hooks/useReactValidation";
import {
  LazyPublicHome,
  LazyLogin,
  LazyNotFound,
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppWrapper>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LazyLogin />} />
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster />
        </AppWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
