
// Extend ServiceWorkerRegistration to include experimental APIs
declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
    periodicSync?: PeriodicSyncManager;
  }

  interface SyncManager {
    register(tag: string): Promise<void>;
  }

  interface PeriodicSyncManager {
    register(tag: string, options?: { minInterval?: number }): Promise<void>;
  }

  interface Window {
    launchQueue?: {
      setConsumer(consumer: (launchParams: any) => void): void;
    };
  }
}

export {};
