import { useEffect } from 'react';

export const usePWAFeatures = () => {
  useEffect(() => {
    // Register periodic sync when service worker is ready
    if ('serviceWorker' in navigator && 'periodicSync' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // @ts-ignore - periodicSync is experimental
        return registration.periodicSync.register('content-sync', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
      }).catch(err => {
        console.log('Periodic sync registration failed:', err);
      });
    }

    // Handle file handlers
    if ('launchQueue' in window) {
      // @ts-ignore - launchQueue is experimental
      window.launchQueue.setConsumer((launchParams) => {
        if (launchParams.files && launchParams.files.length) {
          const files = launchParams.files;
          // Handle file uploads
          window.location.href = '/equipment/new?files=' + files.length;
        }
      });
    }

    // Handle protocol handlers
    const handleProtocol = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PROTOCOL_HANDLER') {
        const url = event.data.url;
        const equipmentId = url.replace('web+needyfy:', '');
        window.location.href = `/equipment/${equipmentId}`;
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleProtocol);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleProtocol);
    };
  }, []);

  // Background sync status
  const isOnline = navigator.onLine;
  
  return {
    isOnline,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    supportsPeriodicSync: 'serviceWorker' in navigator && 'periodicSync' in window,
  };
};