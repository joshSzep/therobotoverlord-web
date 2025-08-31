import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance monitoring (lower sample rate for server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Environment configuration
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Error filtering for server
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filter out known non-critical server errors
    const error = hint.originalException
    if (error instanceof Error) {
      // Skip common server errors that aren't actionable
      if (error.message.includes('ECONNRESET') || 
          error.message.includes('EPIPE')) {
        return null
      }
    }
    
    return event
  },
  
  // Server integrations
  integrations: [
    Sentry.httpIntegration(),
  ],
  
  // Initial scope for server
  initialScope: {
    tags: {
      component: 'web-server',
    },
  },
})
