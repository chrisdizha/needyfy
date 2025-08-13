
interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

interface UserProperties {
  user_id?: string;
  [key: string]: any;
}

class Analytics {
  private userId: string | null = null;
  private isEnabled: boolean = !import.meta.env.DEV;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('📊 Analytics Event (Dev Mode):', eventName, parameters);
      return;
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', eventName, parameters);
    }

    // In production, this would send to your analytics service
    // Example: gtag('event', eventName, parameters);
  }

  trackPageView(path: string, title?: string) {
    this.trackEvent('page_view', {
      page_path: path,
      page_title: title || document.title,
      user_id: this.userId,
    });
  }

  trackUserAction(action: string, category: string, parameters?: Record<string, any>) {
    this.trackEvent('user_action', {
      action,
      category,
      user_id: this.userId,
      ...parameters,
    });
  }

  trackBooking(bookingId: string, equipmentId: string, totalPrice: number) {
    this.trackEvent('booking_created', {
      booking_id: bookingId,
      equipment_id: equipmentId,
      value: totalPrice,
      currency: 'USD',
      user_id: this.userId,
    });
  }

  trackError(error: string, context?: string) {
    this.trackEvent('error', {
      error_message: error,
      error_context: context,
      user_id: this.userId,
    });
  }

  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return;

    if (import.meta.env.DEV) {
      console.log('📊 User Properties:', properties);
    }

    // In production, this would set user properties in your analytics service
  }
}

export const analytics = new Analytics();
