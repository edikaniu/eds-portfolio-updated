"use client"

import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ErrorStateProps {
  title?: string
  message?: string
  showRetry?: boolean
  showGoHome?: boolean
  showGoBack?: boolean
  onRetry?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  showRetry = true,
  showGoHome = false,
  showGoBack = false,
  onRetry,
  className = "",
  size = 'md'
}: ErrorStateProps) {
  const router = useRouter()

  const sizeClasses = {
    sm: {
      container: "p-4",
      icon: "h-8 w-8",
      title: "text-lg",
      message: "text-sm",
      button: "text-sm"
    },
    md: {
      container: "p-6",
      icon: "h-12 w-12",
      title: "text-xl",
      message: "text-base",
      button: "text-base"
    },
    lg: {
      container: "p-8",
      icon: "h-16 w-16",
      title: "text-2xl",
      message: "text-lg",
      button: "text-lg"
    }
  }

  const styles = sizeClasses[size]

  return (
    <Card className={`${styles.container} text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <AlertTriangle className={`${styles.icon} text-red-500`} />
        </div>
        
        <div className="space-y-2">
          <h3 className={`font-semibold text-gray-900 ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-gray-600 max-w-md mx-auto ${styles.message}`}>
            {message}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size={size === 'lg' ? 'lg' : 'default'}
              className={`${styles.button} min-w-[120px]`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {showGoBack && (
            <Button
              onClick={() => router.back()}
              variant="outline"
              size={size === 'lg' ? 'lg' : 'default'}
              className={`${styles.button} min-w-[120px]`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          
          {showGoHome && (
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size={size === 'lg' ? 'lg' : 'default'}
              className={`${styles.button} min-w-[120px]`}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Specialized error components for common use cases
export function APIErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Unable to load data"
      message="We couldn't fetch the latest information. Please check your connection and try again."
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  )
}

export function NotFoundErrorState({ 
  itemType = "content",
  showGoHome = true,
  showGoBack = true 
}: { 
  itemType?: string
  showGoHome?: boolean
  showGoBack?: boolean
}) {
  return (
    <ErrorState
      title={`${itemType} not found`}
      message={`The ${itemType.toLowerCase()} you're looking for doesn't exist or may have been moved.`}
      showRetry={false}
      showGoHome={showGoHome}
      showGoBack={showGoBack}
    />
  )
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection problem"
      message="Unable to connect to our servers. Please check your internet connection and try again."
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  )
}