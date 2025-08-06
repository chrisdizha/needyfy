import { createContext, useContext, useEffect, ReactNode } from 'react';
import { optimizedAnalytics } from '@/lib/optimizedAnalytics';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface AnalyticsContextType {
  trackEvent: typeof optimizedAnalytics.trackEvent;
  trackPageView: typeof optimizedAnalytics.trackPageView;
  trackUserAction: typeof optimizedAnalytics.trackUserAction;
  trackBooking: typeof optimizedAnalytics.trackBooking;
  trackError: typeof optimizedAnalytics.trackError;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { user } = useAuth();

  useEffect(() => {
    // Set user ID when user logs in/out
    optimizedAnalytics.setUserId(user?.id || null);
  }, [user]);

  const value: AnalyticsContextType = {
    trackEvent: optimizedAnalytics.trackEvent.bind(optimizedAnalytics),
    trackPageView: optimizedAnalytics.trackPageView.bind(optimizedAnalytics),
    trackUserAction: optimizedAnalytics.trackUserAction.bind(optimizedAnalytics),
    trackBooking: optimizedAnalytics.trackBooking.bind(optimizedAnalytics),
    trackError: optimizedAnalytics.trackError.bind(optimizedAnalytics),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};