import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Minimal configuration for edge runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  
  // Environment configuration
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Edge-specific configuration (minimal integrations)
  debug: false,
  
  // Initial scope for edge
  initialScope: {
    tags: {
      component: 'web-edge',
    },
  },
})
