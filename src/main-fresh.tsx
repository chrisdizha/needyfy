import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// FRESH START - New entry point to bypass cache issues
console.log('🆕 FRESH ENTRY POINT: New main loaded at', new Date().toISOString());

// Create QueryClient
const queryClient = new QueryClient();

// Render the app with fresh AuthProvider
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);