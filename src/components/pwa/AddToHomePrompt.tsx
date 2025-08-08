import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download } from 'lucide-react';

// A small, reusable Add to Home Screen prompt using the beforeinstallprompt event
// Uses semantic design tokens via existing UI components
const AddToHomePrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('a2hs-dismissed');
    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!hasDismissed) setVisible(true);
    };

    // If already installable (some browsers fire at load), we still catch it
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
  }, []);

  const handleInstall = async () => {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('a2hs-dismissed', '1');
        setVisible(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.log('A2HS prompt error:', err);
    }
  };

  const handleClose = () => {
    localStorage.setItem('a2hs-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-auto">
      <Card className="shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="p-4 flex items-center gap-4">
          <img
            src="/icon-192x192.png"
            alt="Install Needyfy PWA icon"
            width={48}
            height={48}
            loading="lazy"
            className="rounded"
          />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Install Needyfy</h2>
            <p className="text-xs text-muted-foreground">Add to your home screen for fast access and an app-like experience.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleClose} aria-label="Dismiss install prompt">
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleInstall} aria-label="Install Needyfy">
              <Download className="h-4 w-4 mr-1" /> Install
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddToHomePrompt;
