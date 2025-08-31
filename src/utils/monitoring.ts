import * as Sentry from "@sentry/nextjs";

/**
 * Error tracking and monitoring utilities
 */

export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: "error" | "warning" | "info" | "debug";
}

/**
 * Capture and report errors to Sentry
 */
export function captureError(error: Error, context?: ErrorContext): void {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING !== "true") {
    console.error("Error captured:", error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture custom messages
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING !== "true") {
    console.log("Message captured:", message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser(context.user);
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    const level = context?.level || "info";
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: ErrorContext["user"]): void {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING !== "true") {
    return;
  }

  Sentry.setUser(user || null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING !== "true") {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category: category || "custom",
    data,
    level: "info",
    timestamp: Date.now() / 1000,
  });
}

/**
 * Performance monitoring
 */
export function startTransaction(_name: string, _op?: string) {
  if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING !== "true") {
    return {
      finish: () => {},
      setTag: (_key: string, _value: string) => {},
      setData: (_key: string, _value: unknown) => {},
    };
  }

  // Return a mock transaction object for compatibility
  return {
    finish: () => {},
    setTag: (_key: string, _value: string) => {},
    setData: (_key: string, _value: unknown) => {},
  };
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  const transaction = startTransaction(name, "function");

  try {
    const result = await fn();
    transaction.setTag("status", "success");
    return result;
  } catch (error) {
    transaction.setTag("status", "error");
    captureError(error as Error, {
      ...context,
      tags: {
        ...context?.tags,
        function: name,
      },
    });
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * React error boundary helper
 */
export function captureReactError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  captureError(error, {
    tags: {
      component: "react",
    },
    extra: {
      componentStack: errorInfo.componentStack,
    },
    level: "error",
  });
}
