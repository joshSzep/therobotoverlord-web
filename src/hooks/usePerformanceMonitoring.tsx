'use client';

import { useEffect, useCallback, useRef } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

// Performance observer for monitoring
export const usePerformanceMonitoring = (componentName?: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  });
  const performanceEntries = useRef<PerformanceEntry[]>([]);

  // Measure component render time
  const measureRenderTime = useCallback((componentName: string, renderTime: number) => {
    const entry = {
      name: componentName,
      entryType: 'measure' as const,
      startTime: performance.now() - renderTime,
      duration: renderTime
    };
    
    performanceEntries.current.push(entry);
    
    if (renderTime > 16) { // > 16ms indicates potential performance issue
      console.warn(`Slow render: ${componentName} took ${renderTime}ms`);
    }
    
    return renderTime;
  }, []);

  // Measure interaction response time
  const measureInteraction = useCallback((interactionName: string) => {
    const startTime = Date.now();
    
    return () => {
      const interactionTime = Date.now() - startTime;
      metricsRef.current.interactionTime = interactionTime;
      
      if (interactionTime > 100) {
        console.warn(`Slow interaction in ${componentName || 'component'} (${interactionName}): ${interactionTime}ms`);
      }
      
      return interactionTime;
    };
  }, [componentName]);

  // Report performance metrics
  const reportMetrics = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const metrics = {
        ...metricsRef.current,
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        memoryUsage: memory?.usedJSHeapSize || 0
      };
      
      // Send to analytics service (placeholder)
      if (process.env.NODE_ENV === 'production') {
        // In production, send to your analytics service
        console.log('Performance metrics:', metrics);
      }
      
      return metrics;
    }
    
    return metricsRef.current;
  }, []);

  // Monitor Core Web Vitals
  const monitorWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          if (fidEntry.processingStart) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            console.log('FID:', fid);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    };

    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    try {
      observeLCP();
      observeFID();
      observeCLS();
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }, []);

  useEffect(() => {
    monitorWebVitals();
    
    return () => {
      measureRenderTime();
    };
  }, [monitorWebVitals, measureRenderTime]);

  return {
    measureRenderTime,
    measureInteraction,
    reportMetrics,
    metrics: metricsRef.current
  };
};

// Hook for monitoring bundle size and code splitting effectiveness
export const useBundleAnalysis = () => {
  const analyzeBundle = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const bundleInfo = {
      scriptCount: scripts.length,
      stylesheetCount: stylesheets.length,
      totalSize: 0
    };

    // In a real implementation, you'd fetch actual file sizes
    console.log('Bundle analysis:', bundleInfo);
    return bundleInfo;
  }, []);

  return { analyzeBundle };
};

// Hook for monitoring memory usage
export const useMemoryMonitoring = () => {
  const checkMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      if (memory) {
        const usage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
        
        if (usage.percentage > 80) {
          console.warn('High memory usage detected:', usage);
        }
        
        return usage;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  return { checkMemoryUsage };
};

// Hook for monitoring network performance
export const useNetworkMonitoring = () => {
  const monitorNetworkRequests = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          const duration = resource.responseEnd - resource.requestStart;
          
          if (duration > 1000) { // Slow requests > 1s
            console.warn(`Slow network request: ${resource.name} took ${duration}ms`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, []);

  return { monitorNetworkRequests };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC<{
  children: React.ReactNode;
  componentName?: string;
  enableLogging?: boolean;
}> = ({ children, componentName, enableLogging = process.env.NODE_ENV === 'development' }) => {
  const { measureRenderTime, reportMetrics } = usePerformanceMonitoring(componentName);
  const { checkMemoryUsage } = useMemoryMonitoring();
  const { monitorNetworkRequests } = useNetworkMonitoring();

  useEffect(() => {
    if (enableLogging) {
      const cleanup = monitorNetworkRequests();
      
      // Report metrics after component mounts
      setTimeout(() => {
        reportMetrics();
        checkMemoryUsage();
      }, 1000);
      
      return cleanup;
    }
  }, [enableLogging, monitorNetworkRequests, reportMetrics, checkMemoryUsage]);

  return <>{children}</>;
};

export default usePerformanceMonitoring;
