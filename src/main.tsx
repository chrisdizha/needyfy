
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enhanced service worker registration with timeout handling and background sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Set a timeout for service worker registration
    const registrationTimeout = setTimeout(() => {
      console.warn('Service worker registration timed out');
    }, 10000); // 10 second timeout

    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        clearTimeout(registrationTimeout);
        console.log('SW registered: ', registration);
        
        // Request persistent storage
        if ('storage' in navigator && 'persist' in navigator.storage) {
          navigator.storage.persist().then((persistent) => {
            console.log('Persistent storage:', persistent);
          });
        }

        // Register for background sync
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          registration.sync.register('background-sync').then(() => {
            console.log('Background sync registered');
          }).catch((err) => {
            console.log('Background sync registration failed:', err);
          });
        }

        // Register for periodic sync (if supported)
        if ('periodicSync' in window.ServiceWorkerRegistration.prototype) {
          // @ts-ignore - periodicSync is experimental
          registration.periodicSync.register('periodic-content-sync', {
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          }).then(() => {
            console.log('Periodic sync registered');
          }).catch((err) => {
            console.log('Periodic sync registration failed:', err);
          });
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, notify user
                console.log('New content available');
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        clearTimeout(registrationTimeout);
        console.log('SW registration failed: ', registrationError);
      });
  });
}
