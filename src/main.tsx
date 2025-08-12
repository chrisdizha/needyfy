
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced error handling for root creation
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

let root;
try {
  root = createRoot(rootElement);
  console.log('✅ React root created successfully');
} catch (error) {
  console.error('❌ Failed to create React root:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h2>Application Failed to Start</h2>
      <p>React root creation failed. Please refresh the page.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
        Reload Page
      </button>
    </div>
  `;
  throw error;
}

try {
  root.render(<App />);
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to render App:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h2>Application Render Error</h2>
      <p>The app failed to render. Please refresh the page.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
        Reload Page
      </button>
    </div>
  `;
  throw error;
}

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

        // Register for background sync with proper type handling
        if ('sync' in registration) {
          (registration as any).sync.register('background-sync').then(() => {
            console.log('Background sync registered');
          }).catch((err: any) => {
            console.log('Background sync registration failed:', err);
          });
        }

        // Register for periodic sync (if supported)
        if ('periodicSync' in registration) {
          (registration as any).periodicSync.register('periodic-content-sync', {
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          }).then(() => {
            console.log('Periodic sync registered');
          }).catch((err: any) => {
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
