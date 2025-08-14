
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, showing update notification');
                setShowUpdate(true);
              }
            });
          }
        });

        // Check for waiting service worker
        if (reg.waiting) {
          setShowUpdate(true);
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed, reloading page');
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <Card className="shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Update Available</h3>
              <p className="text-xs text-muted-foreground mb-3">
                A new version of Needyfy is available with improvements and bug fixes.
              </p>
              
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleUpdate}>
                  Update Now
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
