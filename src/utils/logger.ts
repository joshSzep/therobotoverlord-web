/**
 * Structured logging utility
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private context: LogContext = {};

  constructor() {
    this.level = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];

    if (typeof window !== "undefined") {
      // Client-side logging
      const style = this.getConsoleStyle(entry.level);
      console.log(
        `%c[${levelName}] ${entry.message}`,
        style,
        entry.context,
        entry.error
      );
    } else {
      // Server-side logging
      const logData = JSON.stringify(entry);

      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(logData);
          break;
        case LogLevel.WARN:
          console.warn(logData);
          break;
        case LogLevel.INFO:
          console.info(logData);
          break;
        case LogLevel.DEBUG:
          console.debug(logData);
          break;
      }
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToLoggingService(entry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return "color: #dc3545; font-weight: bold;";
      case LogLevel.WARN:
        return "color: #ffc107; font-weight: bold;";
      case LogLevel.INFO:
        return "color: #17a2b8;";
      case LogLevel.DEBUG:
        return "color: #6c757d;";
      default:
        return "";
    }
  }

  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    try {
      // Send to external logging service (e.g., DataDog, LogRocket, etc.)
      if (typeof window !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/logs", JSON.stringify(entry));
      } else if (typeof fetch !== "undefined") {
        fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        }).catch(() => {}); // Fail silently to avoid logging loops
      }
    } catch {
      // Fail silently to avoid logging loops
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.formatLogEntry(
        LogLevel.ERROR,
        message,
        context,
        error
      );
      this.output(entry);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.formatLogEntry(LogLevel.WARN, message, context);
      this.output(entry);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.formatLogEntry(LogLevel.INFO, message, context);
      this.output(entry);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.formatLogEntry(LogLevel.DEBUG, message, context);
      this.output(entry);
    }
  }

  // Convenience methods for common scenarios
  apiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(`API ${method} ${url} - ${statusCode} (${duration}ms)`, {
      ...context,
      component: "api",
      action: "request",
      metadata: { method, url, statusCode, duration },
    });
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      component: "user",
      action,
    });
  }

  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric} = ${value}`, {
      ...context,
      component: "performance",
      action: "metric",
      metadata: { metric, value },
    });
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      component: "security",
      action: "event",
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Middleware for request logging
export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.setContext({ requestId });

    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.apiRequest(req.method, req.url, res.statusCode, duration, {
        requestId,
        userAgent: req.headers?.["user-agent"],
        ip: req.ip || req.connection?.remoteAddress,
      });
    });

    next();
  };
};

// Error logging helper
export function logError(error: Error, context?: LogContext): void {
  logger.error(error.message, context, error);
}

// Performance logging helper
export async function logPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.performance(name, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`${name} failed after ${duration}ms`, context, error as Error);
    throw error;
  }
}
