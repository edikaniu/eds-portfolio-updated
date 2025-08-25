'use client'
 
import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { reportError } from '@/lib/error-handler'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error using our centralized logger
    logger.error('Global application error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR'
    })
    
    // Report the error
    reportError(error, { type: 'globalError', digest: error.digest })
  }, [error])
 
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Application Error
            </h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              A critical error has occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ 
                textAlign: 'left', 
                backgroundColor: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>
                  Error Details
                </summary>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {error.message}
                  {error.digest && (
                    <div style={{ marginTop: '8px' }}>
                      <strong>Error ID:</strong> {error.digest}
                    </div>
                  )}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={reset}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#0070f3',
                  border: '1px solid #0070f3',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}