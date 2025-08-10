// No-op hook: service worker is registered in src/main.tsx outside React
// Keeping export for backward compatibility; does nothing to avoid hook runtime issues
export const useServiceWorker = () => {
  // intentionally empty
};
