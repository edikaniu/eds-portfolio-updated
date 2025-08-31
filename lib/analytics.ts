/**
 * Enhanced analytics utilities with Google Analytics support
 */

import { logger } from './logger'

// Global gtag function type definition
declare global {
  interface Window {
    gtag: {
      (...args: any[]): void
      q?: any[]
    }
  }
}

// Analytics configuration
export const ANALYTICS_CONFIG = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
  debug: process.env.NODE_ENV === 'development',
  enableTracking: process.env.NODE_ENV === 'production' || process.env.ENABLE_ANALYTICS === 'true',
} as const

// Event tracking types
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

// Enhanced analytics class
class Analytics {
  private initialized = false

  init() {
    if (this.initialized || !ANALYTICS_CONFIG.enableTracking) return
    
    // Google Analytics
    if (ANALYTICS_CONFIG.googleAnalyticsId && typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalyticsId}`
      script.async = true
      document.head.appendChild(script)

      window.gtag = window.gtag || function(...args: any[]) {
        (window.gtag.q = window.gtag.q || []).push(args)
      }
      
      window.gtag('js', new Date())
      window.gtag('config', ANALYTICS_CONFIG.googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href,
      })

      this.initialized = true
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (ANALYTICS_CONFIG.debug) {
      logger.info('Analytics event:', { ...event })
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      })
    }
  }

  trackPageView(path: string) {
    if (ANALYTICS_CONFIG.debug) {
      logger.info('Page view:', { path })
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.googleAnalyticsId, {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }

  trackContactForm() {
    this.trackEvent({
      action: 'contact_form_submit',
      category: 'engagement',
      label: 'contact_form'
    })
  }

  trackProjectView(projectTitle: string) {
    this.trackEvent({
      action: 'project_view',
      category: 'content',
      label: projectTitle
    })
  }

  trackBlogRead(postTitle: string) {
    this.trackEvent({
      action: 'blog_read',
      category: 'content',
      label: postTitle
    })
  }

  trackDownload(filename: string) {
    this.trackEvent({
      action: 'download',
      category: 'engagement',
      label: filename
    })
  }
}

export const analytics = new Analytics()

// Legacy exports for compatibility
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event)
export const trackPageView = (path: string) => analytics.trackPageView(path)