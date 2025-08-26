'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorId: null 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR'
    }

    logger.error('Error Boundary caught error', errorDetails)

    // Report to external error tracking service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: true,
        error_id: this.state.errorId
      })
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  We encountered an unexpected error. Don't worry, our team has been notified.
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload} 
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Show Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto max-h-40">
                    <div className="font-bold mb-2">{this.state.error.message}</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different parts of the app
export class AdminErrorBoundary extends ErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    super.componentDidCatch(error, errorInfo)
    
    // Additional admin-specific error handling
    logger.error('Admin Error Boundary', {
      ...error,
      context: 'admin_panel',
      userId: 'current_admin_user' // Would be actual user ID in real app
    })
  }
}

export class AsyncErrorBoundary extends ErrorBoundary {
  componentDidMount() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`)
    this.setState({
      hasError: true,
      error,
      errorId: `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    event.preventDefault() // Prevent default browser error handling
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    const errorId = `hook_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.error('useErrorHandler caught error', {
      message: error.message,
      stack: error.stack,
      errorId,
      errorInfo,
      timestamp: new Date().toISOString()
    })

    // In a real app, you might want to show a toast notification or redirect
    throw error // Re-throw to be caught by error boundary
  }, [])
}