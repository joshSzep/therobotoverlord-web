/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  loadTime?: number
  domContentLoaded?: number
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
  dns?: number
  tcp?: number
  tls?: number
  download?: number
  domProcessing?: number
  total?: number
}

interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: string
}

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

/**
 * Get network information if available
 */
export function getNetworkInfo(): NetworkInfo | null {
  if (typeof navigator === 'undefined') return null
  
  try {
    // Type assertion for experimental API
    const nav = navigator as any
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    return connection || null
  } catch {
    return null
  }
}

/**
 * Collect Core Web Vitals and performance metrics
 */
export function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics = {}
    let metricsCollected = 0
    const totalMetrics = 7

    function checkComplete() {
      metricsCollected++
      if (metricsCollected >= totalMetrics) {
        resolve(metrics)
      }
    }

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        metrics.lcp = entries[entries.length - 1].startTime
      }
      checkComplete()
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        const entry = entries[0] as any
        metrics.fid = entry.processingStart - entry.startTime
      }
      checkComplete()
    }).observe({ entryTypes: ['first-input'] })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value
        }
      }
      metrics.cls = clsValue
      checkComplete()
    }).observe({ entryTypes: ['layout-shift'] })

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metrics.fcp = navigation.responseStart - navigation.fetchStart
      metrics.ttfb = navigation.responseStart - navigation.requestStart
      metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      checkComplete()
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
    }
    checkComplete()

    // Fallback timeout
    setTimeout(() => {
      resolve(metrics)
    }, 5000)
  })
}

/**
 * Monitor resource loading performance
 */
export function monitorResourcePerformance(): PerformanceEntry[] {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  return resources.map(resource => ({
    name: resource.name,
    startTime: resource.startTime,
    duration: resource.duration,
    type: getResourceType(resource.name),
  })).filter(resource => resource.duration > 0)
}

/**
 * Get resource type from URL
 */
function getResourceType(url: string): string {
  if (url.includes('.js')) return 'script'
  if (url.includes('.css')) return 'stylesheet'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  if (url.includes('.woff') || url.includes('.ttf')) return 'font'
  return 'other'
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  lcp: number // ms
  fid: number // ms
  cls: number // score
  loadTime: number // ms
  bundleSize: number // bytes
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1 score
  loadTime: 3000, // 3s
  bundleSize: 500000, // 500KB
}

export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
): { passed: boolean; violations: string[] } {
  const violations: string[] = []

  if (metrics.lcp && metrics.lcp > budget.lcp) {
    violations.push(`LCP exceeded: ${metrics.lcp}ms > ${budget.lcp}ms`)
  }

  if (metrics.fid && metrics.fid > budget.fid) {
    violations.push(`FID exceeded: ${metrics.fid}ms > ${budget.fid}ms`)
  }

  if (metrics.cls && metrics.cls > budget.cls) {
    violations.push(`CLS exceeded: ${metrics.cls} > ${budget.cls}`)
  }

  if (metrics.loadTime && metrics.loadTime > budget.loadTime) {
    violations.push(`Load time exceeded: ${metrics.loadTime}ms > ${budget.loadTime}ms`)
  }

  return {
    passed: violations.length === 0,
    violations,
  }
}

/**
 * Real User Monitoring (RUM) data collection
 */
export class RUMCollector {
  private metrics: PerformanceMetrics = {}
  private isCollecting = false

  start() {
    if (this.isCollecting || typeof window === 'undefined') return

    this.isCollecting = true
    this.setupObservers()
  }

  private setupObservers() {
    // Collect metrics when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics()
    })

    // Collect metrics after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectAndSend()
      }, 1000)
    })

    // Collect metrics on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendMetrics()
      }
    })
  }

  private async collectAndSend() {
    try {
      this.metrics = await collectPerformanceMetrics()
      this.sendMetrics()
    } catch (error) {
      console.error('Failed to collect performance metrics:', error)
    }
  }

  private sendMetrics() {
    if (Object.keys(this.metrics).length === 0) return

    // Send to analytics
    if (process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      // Send to your analytics service
      this.sendToAnalytics(this.metrics)
    }

    // Send to monitoring service
    this.sendToMonitoring(this.metrics)
  }

  private sendToAnalytics(metrics: PerformanceMetrics) {
    // Integration with analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          window.gtag!('event', 'performance_metric', {
            metric_name: key,
            metric_value: Math.round(value),
            custom_map: { metric: key },
          })
        }
      })
    }
  }

  private sendToMonitoring(metrics: PerformanceMetrics) {
    // Send to monitoring endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics,
      })

      navigator.sendBeacon('/api/monitoring/performance', data)
    }
  }
}

/**
 * Performance optimization helpers
 */
export const performanceUtils = {
  // Preload critical resources
  preloadResource(href: string, as: string, crossorigin?: string) {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (crossorigin) link.crossOrigin = crossorigin

    document.head.appendChild(link)
  },

  // Prefetch next page resources
  prefetchPage(href: string) {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href

    document.head.appendChild(link)
  },

  // Measure function performance
  async measureFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      console.log(`${name} took ${duration.toFixed(2)}ms`)
      
      // Mark performance entry
      performance.mark(`${name}-start`)
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`${name} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  },

  // Check if device has good performance characteristics
  isHighPerformanceDevice(): boolean {
    if (typeof navigator === 'undefined') return true

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 1
    
    // Check memory (if available)
    const memory = (navigator as any).deviceMemory || 4
    
    // Check connection (if available)
    const connection = getNetworkInfo()
    const effectiveType = connection?.effectiveType || '4g'
    
    return cores >= 4 && memory >= 4 && effectiveType !== 'slow-2g'
  },

  // Adaptive loading based on device capabilities
  shouldLoadHighQualityAssets(): boolean {
    const connection = getNetworkInfo()
    return this.isHighPerformanceDevice() && 
           !connection?.saveData &&
           connection?.effectiveType !== 'slow-2g'
  },
}

// Initialize RUM collector
export const rumCollector = new RUMCollector()
