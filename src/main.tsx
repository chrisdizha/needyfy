
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useServiceWorker } from '@/hooks/useServiceWorker'

const AppWithServiceWorker = () => {
  useServiceWorker();
  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithServiceWorker />
  </React.StrictMode>
);

