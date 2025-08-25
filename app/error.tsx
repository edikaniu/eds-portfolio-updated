'use client'
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'
import { reportError } from '@/lib/error-handler'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error using centralized error handling
    logger.error('Application error occurred', error, {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })
    
    // Report the error
    reportError(error, { type: 'pageError', digest: error.digest })
  }, [error])
 
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 lg:px-12 xl:px-16">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h1>
          <p className="text-muted-foreground mb-4">
            An unexpected error has occurred. Don't worry, we're working to fix it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted p-4 rounded-lg mb-4">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="text-xs overflow-auto">
                {error.message}
                {error.digest && (
                  <div className="mt-2">
                    <strong>Error ID:</strong> {error.digest}
                  </div>
                )}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full sm:w-auto">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}