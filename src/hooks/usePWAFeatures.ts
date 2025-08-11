
import { useEffect, useState } from 'react';

export const usePWAFeatures = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
        
        // Register for periodic sync when service worker is ready
        if ('periodicSync' in registration) {
          (registration as any).periodicSync.register('periodic-content-sync', {
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          }).catch((err: any) => {
            console.log('Periodic sync registration failed:', err);
          });
        }
      }).catch(err => {
        console.log('Service worker not ready:', err);
      });
    }

    // Handle file handlers
    if (window.launchQueue) {
      window.launchQueue.setConsumer((launchParams: any) => {
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
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleProtocol);
    };
  }, []);

  // Queue action for background sync when offline
  const queueForBackgroundSync = async (action: any) => {
    if (!isOnline && swRegistration) {
      try {
        // Queue the action (in a real app, this would use IndexedDB)
        console.log('Queuing action for background sync:', action);
        
        // Register background sync - use type assertion for experimental API
        if ('sync' in swRegistration) {
          await (swRegistration as any).sync.register('background-sync');
          return true;
        }
      } catch (error) {
        console.error('Failed to queue action:', error);
        return false;
      }
    }
    return false;
  };

  // Request push notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    isOnline,
    swRegistration,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    supportsPeriodicSync: 'serviceWorker' in navigator && 'periodicSync' in window,
    supportsPushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
    queueForBackgroundSync,
    requestNotificationPermission,
  };
};
