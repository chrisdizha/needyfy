
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SecurityProvider } from '@/components/security/SecurityProvider'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import App from './App.tsx'
import './index.css'

const AppWithServiceWorker = () => {
  useServiceWorker();
  return <App />;
};

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <AppWithServiceWorker />
      </SecurityProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
