// Production-safe logging utility
export const logger = {
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error, context)
    } else {
      // In production, log to external service (e.g., Sentry, DataDog)
      // For now, we'll use a minimal console.error for critical errors only
      if (typeof window === 'undefined') {
        // Server-side only
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
      }
      // TODO: Implement external error reporting service
    }
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context)
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context)
    }
  },
  
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context)
    }
  }
}

// Safe error handler for user-facing components
export const handleClientError = (error: unknown, fallbackMessage = 'Something went wrong') => {
  logger.error('Client error occurred', error)
  // Return user-friendly message without exposing internal details
  return fallbackMessage
}