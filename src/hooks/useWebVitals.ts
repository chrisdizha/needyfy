
import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { analytics } from '@/lib/analytics';

interface VitalData {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const useWebVitals = () => {
  useEffect(() => {
    // Track Core Web Vitals and send to analytics
    const sendToAnalytics = (vital: VitalData) => {
      const deviceCategory = window.innerWidth < 768 ? 'mobile' : 'desktop';
      const pageName = window.location.pathname;
      
      analytics.trackEvent('web_vitals', {
        metric: vital.name,
        value: vital.value,
        rating: vital.rating,
        page: pageName,
        device: deviceCategory,
        id: vital.id
      });

      // Log poor vitals in development
      if (import.meta.env.DEV && vital.rating === 'poor') {
        console.warn(`⚠️ Poor ${vital.name}: ${vital.value}ms`, {
          page: pageName,
          device: deviceCategory
        });
      }
    };

    // Track all Core Web Vitals (using onINP instead of onFID for web-vitals v4)
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // Replaces onFID in web-vitals v4
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }, []);
};
