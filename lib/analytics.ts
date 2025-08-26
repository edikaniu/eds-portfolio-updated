/**
 * Minimal analytics utilities
 */

import { logger } from './logger'

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

// Minimal analytics class
class Analytics {
  trackEvent(event: AnalyticsEvent) {
    if (ANALYTICS_CONFIG.debug) {
      logger.info('Analytics event:', { ...event })
    }
  }

  trackPageView(path: string) {
    if (ANALYTICS_CONFIG.debug) {
      logger.info('Page view:', { path })
    }
  }
}

export const analytics = new Analytics()

// Legacy exports for compatibility
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event)
export const trackPageView = (path: string) => analytics.trackPageView(path)