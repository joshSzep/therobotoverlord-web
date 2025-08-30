'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initializeAnalytics, trackPageView, trackWebVitals } from '@/utils/analytics'

export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize analytics on mount
    initializeAnalytics()
    trackWebVitals()
  }, [])

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      trackPageView(window.location.href, document.title)
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
