// Optimized analytics with batching and throttling
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

interface BatchedEvent extends AnalyticsEvent {
  timestamp: number;
  sessionId: string;
  url: string;
}

class OptimizedAnalytics {
  private userId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;
  private eventQueue: BatchedEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private lastFlush: number = 0;
  private performanceEvents: Map<string, number> = new Map();

  // Batch configuration
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private readonly PERFORMANCE_THROTTLE = 30000; // 30 seconds
  private readonly MAX_QUEUE_SIZE = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
    this.setupBeforeUnload();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics() {
    // Lightweight initialization
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        session_id: this.sessionId,
        send_page_view: false // We'll handle page views manually
      });
    }
  }

  private setupBeforeUnload() {
    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });

    // Flush events on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents(true);
      }
    });
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    
    if (typeof (window as any).gtag !== 'undefined' && userId) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }
  }

  // Optimized event tracking with batching
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const batchedEvent: BatchedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userId: this.userId || undefined
    };

    // Add to queue
    this.eventQueue.push(batchedEvent);

    // Prevent queue overflow
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue.shift();
    }

    // Trigger batch processing
    this.scheduleBatchFlush();

    // Send high-priority events immediately
    if (this.isHighPriorityEvent(event)) {
      this.flushEvents();
    }
  }

  // Throttled performance event tracking
  trackPerformanceEvent(component: string, metric: string, value: number) {
    const key = `${component}-${metric}`;
    const now = Date.now();
    const lastTracked = this.performanceEvents.get(key) || 0;

    // Throttle performance events
    if (now - lastTracked < this.PERFORMANCE_THROTTLE) {
      return;
    }

    this.performanceEvents.set(key, now);
    
    this.trackEvent({
      action: 'performance_metric',
      category: 'performance',
      label: `${component}:${metric}`,
      value: Math.round(value),
      metadata: { component, metric }
    });
  }

  // Optimized page view tracking
  trackPageView(path: string, title?: string) {
    if (!this.isEnabled) return;

    // Debounce rapid page view changes
    const now = Date.now();
    if (now - this.lastFlush < 1000) return; // Minimum 1 second between page views

    const pageData = {
      path,
      title: title || document.title,
      timestamp: now
    };

    // Send to Google Analytics immediately (page views are critical)
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'page_view', {
        page_title: pageData.title,
        page_location: window.location.href,
        user_id: this.userId
      });
    }

    // Add to batch queue for other providers
    this.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: path,
      metadata: pageData
    });
  }

  // Efficient error tracking
  trackError(error: Error, context?: Record<string, any>) {
    // Limit error tracking to prevent spam
    const errorKey = `${error.name}:${error.message}`;
    const now = Date.now();
    const lastTracked = this.performanceEvents.get(errorKey) || 0;

    if (now - lastTracked < 5000) return; // Max 1 error per type per 5 seconds

    this.performanceEvents.set(errorKey, now);

    this.trackEvent({
      action: 'error_occurred',
      category: 'error',
      label: error.name,
      metadata: {
        message: error.message,
        stack: error.stack?.substring(0, 500), // Limit stack trace length
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 200), // Limit user agent length
        ...context
      }
    });
  }

  private isHighPriorityEvent(event: AnalyticsEvent): boolean {
    const highPriorityActions = [
      'booking_completed',
      'payment_successful',
      'error_occurred',
      'user_registered'
    ];
    return highPriorityActions.includes(event.action);
  }

  private scheduleBatchFlush() {
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Schedule new batch flush
    this.batchTimeout = setTimeout(() => {
      this.flushEvents();
    }, this.BATCH_TIMEOUT);

    // Flush immediately if batch is full
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flushEvents();
    }
  }

  private flushEvents(force = false) {
    if (this.eventQueue.length === 0) return;

    const now = Date.now();
    
    // Rate limiting: don't flush too frequently unless forced
    if (!force && now - this.lastFlush < 2000) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];
    this.lastFlush = now;

    // Clear timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Send batched events
    this.sendEventBatch(eventsToSend);
  }

  private sendEventBatch(events: BatchedEvent[]) {
    if (events.length === 0) return;

    // Send to Google Analytics (individual events)
    if (typeof (window as any).gtag !== 'undefined') {
      events.forEach(event => {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_parameters: {
            session_id: event.sessionId,
            batch_size: events.length,
            ...event.metadata
          }
        });
      });
    }

    // Send to PostHog (batch)
    if (typeof (window as any).posthog !== 'undefined') {
      events.forEach(event => {
        (window as any).posthog.capture(event.action, {
          category: event.category,
          label: event.label,
          value: event.value,
          session_id: event.sessionId,
          ...event.metadata
        });
      });
    }

    // Store locally for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Batch (${events.length} events):`, events);
      this.storeEventsBatch(events);
    }
  }

  private storeEventsBatch(events: BatchedEvent[]) {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const allEvents = [...existingEvents, ...events];
      
      // Keep only last 50 events to prevent localStorage bloat
      const recentEvents = allEvents.slice(-50);
      
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      // Silently handle storage errors
    }
  }

  // Convenience methods with optimizations
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
        duration: bookingData.duration
      }
    });
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.flushEvents(true); // Flush remaining events before disabling
  }

  // Get analytics summary for debugging
  getAnalyticsSummary() {
    return {
      queueSize: this.eventQueue.length,
      sessionId: this.sessionId,
      userId: this.userId,
      lastFlush: this.lastFlush,
      isEnabled: this.isEnabled,
      performanceEventCount: this.performanceEvents.size
    };
  }
}

export const optimizedAnalytics = new OptimizedAnalytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => optimizedAnalytics.trackEvent(event);
export const trackPageView = (path: string, title?: string) => optimizedAnalytics.trackPageView(path, title);
export const trackUserAction = (action: string, details?: Record<string, any>) => optimizedAnalytics.trackUserAction(action, details);
export const trackBooking = (action: 'initiated' | 'completed' | 'cancelled', bookingData: any) => optimizedAnalytics.trackBooking(action, bookingData);
export const trackError = (error: Error, context?: Record<string, any>) => optimizedAnalytics.trackError(error, context);
export const trackPerformanceEvent = (component: string, metric: string, value: number) => optimizedAnalytics.trackPerformanceEvent(component, metric, value);
