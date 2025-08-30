import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment configuration
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException
    if (error instanceof Error) {
      // Skip network errors that are likely user-related
      if (error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch')) {
        return null
      }
      
      // Skip ResizeObserver errors (common browser quirk)
      if (error.message.includes('ResizeObserver loop limit exceeded')) {
        return null
      }
    }
    
    return event
  },
  
  // Additional configuration
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/api\.therobotoverlord\.com/,
        /^https:\/\/therobotoverlord\.com/,
      ],
    }),
    new Sentry.Replay({
      // Capture replays on errors and a sample of sessions
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // User context
  initialScope: {
    tags: {
      component: 'web-client',
    },
  },
})
