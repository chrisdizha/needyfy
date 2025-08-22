
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n'
import { TranslationDebugger } from './lib/translationValidator'

console.log('🚀 Starting application initialization...');

// Enhanced error handling for root creation
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

console.log('✅ Root element found, creating React root...');

let root;
try {
  root = createRoot(rootElement);
  console.log('✅ React root created successfully');
} catch (error) {
  console.error('❌ Failed to create React root:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red; font-family: Arial, sans-serif;">
      <h2>Application Failed to Start</h2>
      <p>React root creation failed. Please refresh the page.</p>
      <p style="font-size: 12px; color: #666; margin-top: 20px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
  throw error;
}

try {
  console.log('🎨 Rendering App component...');
  root.render(
    <>
      <App />
      <TranslationDebugger />
    </>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to render App:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red; font-family: Arial, sans-serif;">
      <h2>Application Render Error</h2>
      <p>The app failed to render. Please refresh the page.</p>
      <p style="font-size: 12px; color: #666; margin-top: 20px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
  throw error;
}

// Enhanced service worker registration with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      console.log('🔧 Registering service worker for production...');
      
      const registrationTimeout = setTimeout(() => {
        console.warn('⚠️ Service worker registration timed out');
      }, 10000);

      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          clearTimeout(registrationTimeout);
          console.log('✅ SW registered: ', registration);
          
          // Request persistent storage
          if ('storage' in navigator && 'persist' in navigator.storage) {
            navigator.storage.persist().then((persistent) => {
              console.log('💾 Persistent storage:', persistent);
            });
          }

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('🔄 Service worker update found');
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 New service worker installed, ready to activate');
                }
              });
            }
          });

          // Register for background sync
          if ('sync' in registration) {
            (registration as any).sync.register('background-sync').then(() => {
              console.log('🔄 Background sync registered');
            }).catch((err: any) => {
              console.log('❌ Background sync registration failed:', err);
            });
          }

          // Register for periodic sync
          if ('periodicSync' in registration) {
            (registration as any).periodicSync.register('periodic-content-sync', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            }).then(() => {
              console.log('⏰ Periodic sync registered');
            }).catch((err: any) => {
              console.log('❌ Periodic sync registration failed:', err);
            });
          }

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SKIP_WAITING') {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        })
        .catch((registrationError) => {
          clearTimeout(registrationTimeout);
          console.log('❌ SW registration failed: ', registrationError);
        });
    } else {
      console.log('🧹 Development mode: cleaning up any existing service worker...');
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then(() => {
            console.log('🧹 Unregistered stale service worker');
          });
        });
      });
    }
  });
} else {
  console.log('ℹ️ Service worker not supported');
}

console.log('🎉 Application initialization complete');
