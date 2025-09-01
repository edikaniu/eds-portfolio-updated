"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, X, Loader2 } from 'lucide-react'

interface BeehiivEmbedProps {
  className?: string
  width?: string
  height?: string
}

interface NewsletterEmbedData {
  embedCode: string
  attributionCode: string
}

export function BeehiivEmbed({ 
  className = "", 
  width = "100%", 
  height = "auto"
}: BeehiivEmbedProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [embedData, setEmbedData] = useState<NewsletterEmbedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null) // null = loading, false = disabled, true = enabled
  
  // Check if newsletters are enabled when component mounts
  useEffect(() => {
    const checkNewsletterStatus = async () => {
      try {
        const response = await fetch('/api/newsletter/status')
        const data = await response.json()
        
        if (data.success) {
          setIsEnabled(data.data.isEnabled)
        } else {
          setIsEnabled(false)
        }
      } catch (error) {
        console.error('Failed to check newsletter status:', error)
        setIsEnabled(false)
      }
    }
    
    checkNewsletterStatus()
  }, [])
  
  const fetchEmbedCode = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/newsletter/embed')
      const data = await response.json()
      
      if (data.success) {
        setEmbedData(data.data)
        setShowPopup(true)
      } else {
        setError(data.error || 'Newsletter form not configured')
      }
    } catch (error) {
      setError('Failed to load newsletter form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribeClick = () => {
    fetchEmbedCode()
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    setEmbedData(null)
    setError(null)
  }

  // Don't render anything if newsletters are disabled
  if (isEnabled === false) {
    return null
  }

  // Loading state while checking if newsletters are enabled
  if (isEnabled === null) {
    return null // Could also return a skeleton if desired
  }

  // Newsletter popup overlay
  if (showPopup && embedData) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 z-10"
            onClick={handleClosePopup}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Embed content */}
          <div className="p-6">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: embedData.embedCode + (embedData.attributionCode || '') 
              }} 
            />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <Button
          onClick={handleSubscribeClick}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    )
  }

  // Main newsletter CTA
  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`} style={{ width }}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Join the Newsletter
        </h3>
        <p className="text-muted-foreground text-sm">
          Get weekly marketing insights, case studies, and growth tactics delivered to your inbox.
        </p>
      </div>

      <Button
        onClick={handleSubscribeClick}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Subscribe Free
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Free newsletter • Unsubscribe anytime • No spam, ever
      </p>
    </div>
  )
}