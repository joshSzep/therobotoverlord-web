import { NextRequest, NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  level: number
  message: string
  context?: {
    userId?: string
    sessionId?: string
    requestId?: string
    component?: string
    action?: string
    metadata?: Record<string, any>
  }
  error?: {
    name: string
    message: string
    stack?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json()
    
    // Validate log entry
    if (!logEntry.timestamp || !logEntry.message || logEntry.level === undefined) {
      return NextResponse.json(
        { error: 'Invalid log entry format' },
        { status: 400 }
      )
    }
    
    // Process log entry
    await processLogEntry(logEntry)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process log entry:', error)
    return NextResponse.json(
      { error: 'Failed to process log entry' },
      { status: 500 }
    )
  }
}

async function processLogEntry(entry: LogEntry): Promise<void> {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    const levelName = ['ERROR', 'WARN', 'INFO', 'DEBUG'][entry.level] || 'UNKNOWN'
    console.log(`[${levelName}] ${entry.message}`, entry.context, entry.error)
    return
  }
  
  // In production, you would:
  // 1. Store in database for analysis
  // 2. Send to external logging service (DataDog, Splunk, etc.)
  // 3. Trigger alerts for critical errors
  // 4. Aggregate metrics for monitoring
  
  // Example: Send to external logging service
  if (process.env.LOGGING_SERVICE_URL) {
    try {
      await fetch(process.env.LOGGING_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          ...entry,
          service: 'therobotoverlord-web',
          environment: process.env.NEXT_PUBLIC_APP_ENV,
          version: process.env.NEXT_PUBLIC_APP_VERSION,
        }),
      })
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }
  
  // Store critical errors for immediate attention
  if (entry.level === 0) { // ERROR level
    // Store in database or send immediate alert
    console.error('CRITICAL ERROR:', entry)
  }
}
