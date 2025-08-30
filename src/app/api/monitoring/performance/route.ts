import { NextRequest, NextResponse } from 'next/server'

interface PerformanceData {
  timestamp: number
  url: string
  userAgent: string
  metrics: {
    lcp?: number
    fid?: number
    cls?: number
    fcp?: number
    ttfb?: number
    loadTime?: number
    domContentLoaded?: number
    memoryUsage?: {
      used: number
      total: number
      limit: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceData = await request.json()
    
    // Validate the data
    if (!data.timestamp || !data.url || !data.metrics) {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      )
    }
    
    // Log performance data (in production, send to monitoring service)
    console.log('Performance metrics received:', {
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString(),
      metrics: data.metrics,
    })
    
    // In production, you would:
    // 1. Store in database for analysis
    // 2. Send to monitoring service (DataDog, New Relic, etc.)
    // 3. Check against performance budgets
    // 4. Alert if thresholds are exceeded
    
    // Example: Check performance budgets
    const violations = checkPerformanceBudgets(data.metrics)
    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations)
      // Send alert to monitoring system
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing performance data:', error)
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    )
  }
}

function checkPerformanceBudgets(metrics: PerformanceData['metrics']): string[] {
  const violations: string[] = []
  
  // Performance budgets
  const budgets = {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1 score
    loadTime: 3000, // 3s
  }
  
  if (metrics.lcp && metrics.lcp > budgets.lcp) {
    violations.push(`LCP exceeded: ${metrics.lcp}ms > ${budgets.lcp}ms`)
  }
  
  if (metrics.fid && metrics.fid > budgets.fid) {
    violations.push(`FID exceeded: ${metrics.fid}ms > ${budgets.fid}ms`)
  }
  
  if (metrics.cls && metrics.cls > budgets.cls) {
    violations.push(`CLS exceeded: ${metrics.cls} > ${budgets.cls}`)
  }
  
  if (metrics.loadTime && metrics.loadTime > budgets.loadTime) {
    violations.push(`Load time exceeded: ${metrics.loadTime}ms > ${budgets.loadTime}ms`)
  }
  
  return violations
}
