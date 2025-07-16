import { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsContextType {
  trackEvent: typeof analytics.trackEvent;
  trackPageView: typeof analytics.trackPageView;
  trackUserAction: typeof analytics.trackUserAction;
  trackBooking: typeof analytics.trackBooking;
  trackError: typeof analytics.trackError;
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
    analytics.setUserId(user?.id || null);
  }, [user]);

  const value: AnalyticsContextType = {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackBooking: analytics.trackBooking.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};