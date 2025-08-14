
import React from 'react';
import { Wifi, WifiOff, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWAFeatures } from '@/hooks/usePWAFeatures';

export const PWAStatus: React.FC = () => {
  const { isOnline } = usePWAFeatures();

  return (
    <div className="fixed top-4 right-4 z-40">
      <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>
    </div>
  );
};
