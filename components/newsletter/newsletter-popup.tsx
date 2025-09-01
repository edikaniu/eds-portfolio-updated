"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BeehiivEmbed } from './beehiiv-embed'
import { X, Mail, TrendingUp } from 'lucide-react'

interface NewsletterPopupProps {
  trigger?: 'timer' | 'scroll' | 'exit' | 'manual'
  delay?: number // milliseconds for timer trigger
  scrollPercentage?: number // percentage for scroll trigger
  cookieName?: string
  frequencyDays?: number
  title?: string
  description?: string
  onClose?: () => void
}

export function NewsletterPopup({
  trigger = 'timer',
  delay = 30000, // 30 seconds
  scrollPercentage = 60, // 60%
  cookieName = 'newsletter_popup_shown',
  frequencyDays = 7,
  title = "Don't Miss Out on Marketing Insights",
  description = "Get weekly strategies that helped scale 50+ products. Join 2,000+ marketers growing their impact.",
  onClose
}: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  
  useEffect(() => {
    // Check if popup should be shown based on cookie
    const lastShown = localStorage.getItem(cookieName)
    const now = Date.now()
    
    if (!lastShown) {
      setShouldShow(true)
    } else {
      const daysSinceLastShown = (now - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
      if (daysSinceLastShown >= frequencyDays) {
        setShouldShow(true)
      }
    }
  }, [cookieName, frequencyDays])

  useEffect(() => {
    if (!shouldShow) return

    let timeoutId: NodeJS.Timeout
    let scrollHandler: () => void

    if (trigger === 'timer') {
      timeoutId = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }

    if (trigger === 'scroll') {
      scrollHandler = () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrolled >= scrollPercentage) {
          setIsVisible(true)
          window.removeEventListener('scroll', scrollHandler)
        }
      }
      window.addEventListener('scroll', scrollHandler)
    }

    if (trigger === 'exit') {
      const exitHandler = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsVisible(true)
          document.removeEventListener('mouseleave', exitHandler)
        }
      }
      document.addEventListener('mouseleave', exitHandler)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
    }
  }, [trigger, delay, scrollPercentage, shouldShow])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem(cookieName, Date.now().toString())
    onClose?.()
  }

  const handleSubscribe = () => {
    localStorage.setItem(cookieName, Date.now().toString())
    localStorage.setItem(`${cookieName}_subscribed`, 'true')
  }

  if (!isVisible || !shouldShow) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Free Newsletter
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-muted/30 border-b">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-lg font-bold text-primary">2,000+</div>
              <div className="text-xs text-muted-foreground">Marketers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">95%</div>
              <div className="text-xs text-muted-foreground">Open Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">Weekly</div>
              <div className="text-xs text-muted-foreground">Insights</div>
            </div>
          </div>
        </div>

        {/* Embed */}
        <div className="p-6">
          <BeehiivEmbed 
            className="w-full"
            width="100%"
            height="380px"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Join marketers from Google, Meta, HubSpot, and 500+ growing companies
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for manual trigger
export function useNewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false)
  
  const showPopup = () => setIsVisible(true)
  const hidePopup = () => setIsVisible(false)
  
  return {
    isVisible,
    showPopup,
    hidePopup,
    NewsletterPopup: (props: Omit<NewsletterPopupProps, 'trigger'>) => (
      <NewsletterPopup 
        {...props} 
        trigger="manual" 
        onClose={hidePopup}
      />
    )
  }
}