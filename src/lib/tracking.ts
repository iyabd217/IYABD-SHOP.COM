// Tracking System Utilities
// Handles Facebook Pixel, TikTok Pixel, GA4, and GTM

declare global {
  interface Window {
    fbq: any;
    ttq: any;
    dataLayer: any[];
    gtag: any;
  }
}

export const trackEvent = {
  // Facebook Pixel
  facebook: (eventName: string, params?: any) => {
    if (window.fbq) {
      window.fbq('track', eventName, params);
    }
  },

  // TikTok Pixel
  tiktok: (eventName: string, params?: any) => {
    if (window.ttq) {
      window.ttq.track(eventName, params);
    }
  },

  // Google Analytics 4
  google: (eventName: string, params?: any) => {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  },

  // Full Multi-Channel Track
  all: (eventName: string, params?: any) => {
    console.log(`[Tracking] ${eventName}`, params);
    trackEvent.facebook(eventName, params);
    trackEvent.tiktok(eventName, params);
    trackEvent.google(eventName, params);
  }
};

// Ecommerce specific events
export const ecommerceTrack = {
  trackProductView: (params: {id: string, name: string, price: number, category?: string}) => {
    const trackParams = {
      content_ids: [params.id],
      content_name: params.name,
      content_type: 'product',
      value: params.price,
      currency: 'BDT',
      content_category: params.category
    };
    trackEvent.all('ViewContent', trackParams);
  },

  trackAddToCart: (params: {id: string, name: string, price: number, quantity: number}) => {
    const trackParams = {
      content_ids: [params.id],
      content_name: params.name,
      content_type: 'product',
      value: params.price * params.quantity,
      currency: 'BDT'
    };
    trackEvent.all('AddToCart', trackParams);
    trackEvent.tiktok('AddToCart', trackParams);
  },

  trackInitiateCheckout: (total: number, items: any[]) => {
    const params = {
      value: total,
      currency: 'BDT',
      content_ids: items.map(i => i.id),
      num_items: items.length
    };
    trackEvent.all('InitiateCheckout', params);
  },

  trackPurchase: (orderId: string, items: any[], total: number) => {
    const params = {
      order_id: orderId,
      value: total,
      currency: 'BDT',
      content_ids: items.map(i => i.id),
      content_type: 'product',
      num_items: items.length
    };
    trackEvent.all('Purchase', params);
    trackEvent.tiktok('CompletePayment', params);
  },

  trackSearch: (query: string) => {
    trackEvent.all('Search', { search_string: query });
  },

  trackRegistration: () => {
    trackEvent.all('CompleteRegistration');
  },

  trackApplyCoupon: (couponCode: string, discountAmount: number) => {
    trackEvent.all('ApplyCoupon', { coupon_code: couponCode, value: discountAmount, currency: 'BDT' });
  },

  // Bridge to Server-side Conversion API
  trackServerSide: async (eventName: string, data: any) => {
    try {
        await fetch('/api/tracking/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventName, data, timestamp: Math.floor(Date.now() / 1000) })
        });
    } catch (e) {
        console.error("CAPI Bridge Error:", e);
    }
  }
};

export const trackingService = {
    ...trackEvent,
    ...ecommerceTrack
};
