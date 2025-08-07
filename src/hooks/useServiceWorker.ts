import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Request persistent storage
            if ('storage' in navigator && 'persist' in navigator.storage) {
              navigator.storage.persist().then(persistent => {
                console.log('Persistent storage:', persistent);
              });
            }
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);
};