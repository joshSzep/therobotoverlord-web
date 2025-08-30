/**
 * Analytics tracking utilities
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

interface UserProperties {
  user_id?: string
  user_type?: string
  subscription_tier?: string
  [key: string]: any
}

/**
 * Initialize Google Analytics
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    return
  }

  const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  if (!GA_ID) return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer?.push(args)
  }

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

/**
 * Track page views
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    return
  }

  window.gtag?.('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!, {
    page_title: title || document.title,
    page_location: url,
  })
}

/**
 * Track custom events
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    console.log('Analytics event:', event)
    return
  }

  window.gtag?.('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.custom_parameters,
  })
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties): void {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    return
  }

  window.gtag?.('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!, {
    user_id: properties.user_id,
    custom_map: properties,
  })
}

/**
 * Track user interactions
 */
export const analytics = {
  // Authentication events
  signUp: (method: string) => trackEvent({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  }),

  signIn: (method: string) => trackEvent({
    action: 'login',
    category: 'engagement',
    label: method,
  }),

  signOut: () => trackEvent({
    action: 'logout',
    category: 'engagement',
  }),

  // Content interactions
  viewPost: (postId: string, category?: string) => trackEvent({
    action: 'view_item',
    category: 'content',
    label: postId,
    custom_parameters: {
      content_type: 'post',
      item_category: category,
    },
  }),

  createPost: (category?: string) => trackEvent({
    action: 'create_post',
    category: 'engagement',
    custom_parameters: {
      content_type: 'post',
      item_category: category,
    },
  }),

  likePost: (postId: string) => trackEvent({
    action: 'like',
    category: 'engagement',
    label: postId,
    custom_parameters: {
      content_type: 'post',
    },
  }),

  sharePost: (postId: string, method: string) => trackEvent({
    action: 'share',
    category: 'engagement',
    label: postId,
    custom_parameters: {
      content_type: 'post',
      method,
    },
  }),

  // Search and discovery
  search: (query: string, results_count?: number) => trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    custom_parameters: {
      search_term: query,
      results_count,
    },
  }),

  // Navigation
  navigate: (from: string, to: string) => trackEvent({
    action: 'navigate',
    category: 'navigation',
    custom_parameters: {
      from_page: from,
      to_page: to,
    },
  }),

  // Performance tracking
  pageLoad: (page: string, load_time: number) => trackEvent({
    action: 'page_load_time',
    category: 'performance',
    label: page,
    value: Math.round(load_time),
    custom_parameters: {
      page_name: page,
    },
  }),

  // Error tracking
  error: (error_type: string, error_message: string) => trackEvent({
    action: 'exception',
    category: 'error',
    label: error_type,
    custom_parameters: {
      description: error_message,
      fatal: false,
    },
  }),

  // Feature usage
  featureUsage: (feature_name: string, action: string) => trackEvent({
    action: 'feature_usage',
    category: 'engagement',
    label: feature_name,
    custom_parameters: {
      feature_name,
      feature_action: action,
    },
  }),
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    return
  }

  // Track LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      trackEvent({
        action: 'web_vital',
        category: 'performance',
        label: 'LCP',
        value: Math.round(entry.startTime),
        custom_parameters: {
          metric_name: 'largest_contentful_paint',
          metric_value: entry.startTime,
        },
      })
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // Track FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      trackEvent({
        action: 'web_vital',
        category: 'performance',
        label: 'FID',
        value: Math.round((entry as any).processingStart - entry.startTime),
        custom_parameters: {
          metric_name: 'first_input_delay',
          metric_value: (entry as any).processingStart - entry.startTime,
        },
      })
    }
  }).observe({ entryTypes: ['first-input'] })

  // Track CLS (Cumulative Layout Shift)
  let clsValue = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value
      }
    }
    
    trackEvent({
      action: 'web_vital',
      category: 'performance',
      label: 'CLS',
      value: Math.round(clsValue * 1000),
      custom_parameters: {
        metric_name: 'cumulative_layout_shift',
        metric_value: clsValue,
      },
    })
  }).observe({ entryTypes: ['layout-shift'] })
}
