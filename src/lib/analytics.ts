// Analytics tracking utilities
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class Analytics {
  private userId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics() {
    // Initialize Google Analytics if gtag is available
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        session_id: this.sessionId,
        custom_map: { custom_parameter: 'custom_value' }
      });
    }

    // Track initial page load
    this.trackPageView(window.location.pathname);
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    
    // Update Google Analytics user ID
    if (typeof (window as any).gtag !== 'undefined' && userId) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }
  }

  trackEvent({ action, category, label, value, metadata }: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const eventData = {
      action,
      category,
      label,
      value,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      ...metadata
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventData);
    }

    // Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        custom_parameters: metadata
      });
    }

    // Send to PostHog if available
    if (typeof (window as any).posthog !== 'undefined') {
      (window as any).posthog.capture(action, {
        category,
        label,
        value,
        ...metadata
      });
    }

    // Store locally for backup/debugging
    this.storeEventLocally(eventData);
  }

  trackPageView(path: string, title?: string) {
    if (!this.isEnabled) return;

    const pageData = {
      path,
      title: title || document.title,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    };

    // Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageData.title,
        page_location: window.location.href,
        user_id: this.userId
      });
    }

    // Send to PostHog
    if (typeof (window as any).posthog !== 'undefined') {
      (window as any).posthog.capture('$pageview', {
        $current_url: window.location.href,
        $title: pageData.title
      });
    }

    console.log('Page View:', pageData);
  }

  trackUserAction(action: string, details?: Record<string, any>) {
    this.trackEvent({
      action,
      category: 'user_interaction',
      metadata: details
    });
  }

  trackBooking(action: 'initiated' | 'completed' | 'cancelled', bookingData: any) {
    this.trackEvent({
      action: `booking_${action}`,
      category: 'booking',
      label: bookingData.equipmentType,
      value: bookingData.totalPrice,
      metadata: {
        bookingId: bookingData.id,
        equipmentId: bookingData.equipmentId,
        duration: bookingData.duration,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      }
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      action: 'error_occurred',
      category: 'error',
      label: error.name,
      metadata: {
        message: error.message,
        stack: error.stack,
        context
      }
    });
  }

  private storeEventLocally(eventData: any) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(eventData);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event locally:', error);
    }
  }

  getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackPageView = (path: string, title?: string) => analytics.trackPageView(path, title);
export const trackUserAction = (action: string, details?: Record<string, any>) => analytics.trackUserAction(action, details);
export const trackBooking = (action: 'initiated' | 'completed' | 'cancelled', bookingData: any) => analytics.trackBooking(action, bookingData);
export const trackError = (error: Error, context?: Record<string, any>) => analytics.trackError(error, context);
