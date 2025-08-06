import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// CACHE BUST v3 - Complete rebuild to bypass persistent cache issues
console.log('🚀 FRESH START: New main.tsx loaded at', new Date().toISOString());

// Create QueryClient
const queryClient = new QueryClient();

// Render the app without any auth context initially
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);