'use client'

interface AnalyticsEvent {
  eventType: string
  eventData?: Record<string, any>
  page?: string
  referrer?: string
}

interface PageViewData {
  page: string
  title: string
  referrer?: string
  loadTime?: number
}

class ClientAnalytics {
  private sessionId: string
  private userId?: string
  private buffer: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private isTracking: boolean = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return
    
    this.isTracking = !this.isBot() && this.hasConsent()
    
    if (this.isTracking) {
      this.setupPerformanceObserver()
      this.setupEventListeners()
      this.startFlushInterval()
      
      // Track initial page view
      this.trackPageView({
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer || undefined,
        loadTime: this.getPageLoadTime()
      })
    }
  }

  private isBot(): boolean {
    if (typeof window === 'undefined') return true
    
    const botPatterns = [
      /bot/i, /spider/i, /crawler/i, /crawl/i, /scrape/i,
      /lighthouse/i, /pagespeed/i, /chrome-lighthouse/i
    ]
    
    return botPatterns.some(pattern => pattern.test(navigator.userAgent))
  }

  private hasConsent(): boolean {
    // Check for consent cookie or localStorage
    // For now, assume consent - implement proper consent management
    return localStorage.getItem('analytics-consent') !== 'false'
  }

  private getPageLoadTime(): number {
    if (typeof window === 'undefined' || !window.performance) return 0
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    try {
      // Observe Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackEvent({
              eventType: 'performance',
              eventData: {
                metric: 'lcp',
                value: Math.round(entry.startTime),
                page: window.location.pathname
              }
            })
          }
          
          if (entry.entryType === 'first-input') {
            this.trackEvent({
              eventType: 'performance',
              eventData: {
                metric: 'fid',
                value: Math.round((entry as any).processingStart - entry.startTime),
                page: window.location.pathname
              }
            })
          }
        })
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })

      // Observe layout shifts
      let clsValue = 0
      let clsEntries: PerformanceEntry[] = []

      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            clsEntries.push(entry)
          }
        })
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Report CLS when page is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && clsValue > 0) {
          this.trackEvent({
            eventType: 'performance',
            eventData: {
              metric: 'cls',
              value: Math.round(clsValue * 1000) / 1000,
              page: window.location.pathname
            }
          })
        }
      })
    } catch (error) {
      console.warn('Performance observer setup failed:', error)
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (!target) return

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button')!
        this.trackEvent({
          eventType: 'click',
          eventData: {
            element: 'button',
            text: button.textContent?.trim().substring(0, 100),
            id: button.id || undefined,
            className: button.className || undefined
          }
        })
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a')!
        this.trackEvent({
          eventType: 'click',
          eventData: {
            element: 'link',
            text: link.textContent?.trim().substring(0, 100),
            href: link.href,
            external: !link.href.includes(window.location.origin)
          }
        })
      }

      // Track form submissions
      if (target.type === 'submit' || (target.closest('form') && target.tagName === 'BUTTON')) {
        const form = target.closest('form')
        if (form) {
          this.trackEvent({
            eventType: 'form_submit',
            eventData: {
              formId: form.id || undefined,
              formAction: form.action || undefined,
              formMethod: form.method || 'get'
            }
          })
        }
      }
    })

    // Track scroll depth
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100)
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Track at 25%, 50%, 75%, and 100%
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          this.trackEvent({
            eventType: 'scroll',
            eventData: {
              depth: scrollDepth,
              page: window.location.pathname
            }
          })
        }
      }
    }

    let scrollTimeout: NodeJS.Timeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(trackScrollDepth, 100)
    })

    // Track time on page
    let startTime = Date.now()
    let isActive = true

    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        if (timeSpent > 0) {
          this.trackEvent({
            eventType: 'time_on_page',
            eventData: {
              duration: timeSpent,
              page: window.location.pathname
            }
          })
        }
      }
    }

    // Track when user becomes inactive/active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false
        trackTimeOnPage()
      } else {
        isActive = true
        startTime = Date.now()
      }
    })

    // Track time on page when leaving
    window.addEventListener('beforeunload', trackTimeOnPage)

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent({
        eventType: 'javascript_error',
        eventData: {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack?.substring(0, 500)
        }
      })
    })
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 30000) // Flush every 30 seconds
  }

  public trackPageView(data: PageViewData) {
    if (!this.isTracking) return

    this.sendToAPI('page-view', {
      ...data,
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  }

  public trackEvent(event: AnalyticsEvent) {
    if (!this.isTracking) return

    this.buffer.push({
      ...event,
      page: event.page || window.location.pathname,
      referrer: event.referrer || document.referrer || undefined
    })

    // Flush immediately for important events
    if (['form_submit', 'javascript_error', 'performance'].includes(event.eventType)) {
      this.flush()
    }
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  public setConsent(hasConsent: boolean) {
    localStorage.setItem('analytics-consent', String(hasConsent))
    this.isTracking = hasConsent && !this.isBot()
    
    if (!hasConsent && this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    } else if (hasConsent && !this.flushInterval) {
      this.startFlushInterval()
    }
  }

  public flush() {
    if (this.buffer.length === 0) return

    const events = [...this.buffer]
    this.buffer = []

    events.forEach(event => {
      this.sendToAPI('track', {
        ...event,
        sessionId: this.sessionId,
        userId: this.userId,
        userAgent: navigator.userAgent,
        ipAddress: null, // Will be detected server-side
        timestamp: new Date().toISOString()
      })
    })
  }

  private async sendToAPI(action: string, data: any) {
    try {
      await fetch(`/api/admin/analytics?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Analytics tracking failed:', error)
    }
  }

  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush() // Final flush
  }
}

// Create singleton instance
export const analytics = typeof window !== 'undefined' ? new ClientAnalytics() : null

// React hook for easy integration
export function useAnalytics() {
  return {
    trackEvent: (event: AnalyticsEvent) => analytics?.trackEvent(event),
    trackPageView: (data: PageViewData) => analytics?.trackPageView(data),
    setUserId: (userId: string) => analytics?.setUserId(userId),
    setConsent: (hasConsent: boolean) => analytics?.setConsent(hasConsent)
  }
}