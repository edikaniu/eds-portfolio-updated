import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export interface APIError {
  code: string
  message: string
  statusCode: number
  details?: any
  requestId?: string
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR', true)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR', true)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR', true)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR', true)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', true, details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`External service error (${service}): ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', true, details)
  }
}

// Global error handler for API routes
export function handleAPIError(error: unknown, request?: NextRequest): NextResponse {
  const requestId = generateRequestId()
  
  // Log the error
  const errorInfo = {
    requestId,
    url: request?.url,
    method: request?.method,
    headers: Object.fromEntries(request?.headers.entries() || []),
    timestamp: new Date().toISOString(),
    error: {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.constructor.name : 'UnknownError'
    }
  }

  if (error instanceof AppError) {
    logger.error(`API Error: ${error.code}`, {
      ...errorInfo,
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
      details: error.details
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
          requestId
        }
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        logger.error('Prisma Unique Constraint Error', errorInfo)
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNIQUE_CONSTRAINT_ERROR',
              message: 'A record with this information already exists',
              requestId
            }
          },
          { status: 409 }
        )
      case 'P2025':
        logger.error('Prisma Record Not Found Error', errorInfo)
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RECORD_NOT_FOUND',
              message: 'The requested record was not found',
              requestId
            }
          },
          { status: 404 }
        )
      case 'P2003':
        logger.error('Prisma Foreign Key Constraint Error', errorInfo)
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
              message: 'Cannot complete operation due to related records',
              requestId
            }
          },
          { status: 400 }
        )
    }
  }

  // Handle validation errors (e.g., from Zod)
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = error as any
    logger.error('Validation Error', { ...errorInfo, issues: validationError.issues })
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validationError.issues,
          requestId
        }
      },
      { status: 400 }
    )
  }

  // Handle unknown errors
  logger.error('Unhandled API Error', errorInfo)
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error occurred')
          : 'An internal server error occurred',
        requestId
      }
    },
    { status: 500 }
  )
}

// Async wrapper for API routes with error handling
export function withErrorHandling(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error, request)
    }
  }
}

// Error reporting functions
export function reportError(error: Error, context?: any) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  }

  logger.error('Error Report', errorReport)

  // In production, you would send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to external error tracking service
    // await sendToErrorTrackingService(errorReport)
  }
}

// Client-side error handler
export function setupClientErrorHandling() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`)
    reportError(error, { type: 'unhandledrejection', reason: event.reason })
    
    // Prevent default browser error handling
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)
    reportError(error, {
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Health check error types
export class HealthCheckError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`Health check failed for ${service}: ${message}`, 503, 'HEALTH_CHECK_ERROR', true, details)
  }
}

// Error recovery utilities
export class ErrorRecovery {
  private static retryAttempts = new Map<string, number>()
  private static maxRetries = 3
  private static retryDelay = 1000

  static async withRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    const currentAttempts = this.retryAttempts.get(operationId) || 0

    try {
      const result = await operation()
      this.retryAttempts.delete(operationId) // Clear on success
      return result
    } catch (error) {
      if (currentAttempts >= maxRetries) {
        this.retryAttempts.delete(operationId)
        throw new AppError(
          `Operation failed after ${maxRetries} attempts`,
          500,
          'MAX_RETRIES_EXCEEDED',
          true,
          { originalError: error, attempts: currentAttempts + 1 }
        )
      }

      this.retryAttempts.set(operationId, currentAttempts + 1)
      
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, currentAttempts)
      await new Promise(resolve => setTimeout(resolve, delay))

      logger.warn(`Retrying operation ${operationId}`, {
        attempt: currentAttempts + 1,
        maxRetries,
        delay,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return this.withRetry(operation, operationId, maxRetries)
    }
  }

  static clearRetryHistory(operationId?: string) {
    if (operationId) {
      this.retryAttempts.delete(operationId)
    } else {
      this.retryAttempts.clear()
    }
  }
}

// Type guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isOperationalError(error: unknown): boolean {
  return error instanceof AppError && error.isOperational
}