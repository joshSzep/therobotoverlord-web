import { NextRequest, NextResponse } from 'next/server'

interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  uptime: number
  checks: {
    database?: 'healthy' | 'unhealthy'
    redis?: 'healthy' | 'unhealthy'
    external_api?: 'healthy' | 'unhealthy'
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic health checks
    const checks: HealthCheck['checks'] = {}
    
    // Check database connection (if applicable)
    // Uncomment when database is implemented
    // try {
    //   await db.raw('SELECT 1')
    //   checks.database = 'healthy'
    // } catch (error) {
    //   checks.database = 'unhealthy'
    // }
    
    // Check external API connection
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (apiUrl) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        checks.external_api = response.ok ? 'healthy' : 'unhealthy'
      }
    } catch (error) {
      checks.external_api = 'unhealthy'
    }
    
    // Determine overall status
    const allChecksHealthy = Object.values(checks).every(status => status === 'healthy')
    const hasUnhealthyChecks = Object.values(checks).some(status => status === 'unhealthy')
    
    const healthStatus: HealthCheck = {
      status: hasUnhealthyChecks ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      uptime: process.uptime(),
      checks,
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json(
      {
        ...healthStatus,
        responseTime: `${responseTime}ms`,
      },
      {
        status: healthStatus.status === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: `${Date.now() - startTime}ms`,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// Support HEAD requests for simple health checks
export async function HEAD() {
  return new Response(null, { status: 200 })
}
