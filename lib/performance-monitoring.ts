/**
 * Comprehensive performance monitoring and optimization system
 * Tracks Core Web Vitals, resource loading, and provides optimization recommendations
 */

import { logger } from './logger'

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds (Google's recommendations)
  thresholds: {
    // First Contentful Paint (FCP)
    fcp: {
      good: 1800,    // < 1.8s
      needsImprovement: 3000, // 1.8s - 3s
    },
    // Largest Contentful Paint (LCP)
    lcp: {
      good: 2500,    // < 2.5s
      needsImprovement: 4000, // 2.5s - 4s
    },
    // First Input Delay (FID)
    fid: {
      good: 100,     // < 100ms
      needsImprovement: 300,  // 100ms - 300ms
    },
    // Cumulative Layout Shift (CLS)
    cls: {
      good: 0.1,     // < 0.1
      needsImprovement: 0.25, // 0.1 - 0.25
    },
    // Time to First Byte (TTFB)
    ttfb: {
      good: 800,     // < 800ms
      needsImprovement: 1800, // 800ms - 1.8s
    },
    // Interaction to Next Paint (INP)
    inp: {
      good: 200,     // < 200ms
      needsImprovement: 500,  // 200ms - 500ms
    },
  },
  
  // Resource loading thresholds
  resources: {
    maxJSBundleSize: 250 * 1024,    // 250KB
    maxCSSBundleSize: 50 * 1024,    // 50KB
    maxImageSize: 1024 * 1024,      // 1MB
    maxTotalResources: 100,         // Max number of resources
  },
  
  // Performance budget alerts
  budget: {
    totalPageWeight: 2048 * 1024,   // 2MB
    totalRequests: 50,              // Max requests per page
    maxDOMNodes: 1500,              // Max DOM elements
    maxDOMDepth: 10,                // Max nesting level
  },
  
  // Monitoring settings
  enableReporting: process.env.NODE_ENV === 'production',
  enableDevelopmentWarnings: process.env.NODE_ENV === 'development',
  reportingInterval: 30000,        // 30 seconds
  batchSize: 10,                   // Batch metrics before sending
} as const

// Performance metric types
export interface WebVitalMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender'
}

export interface ResourceMetric {
  name: string
  type: string
  size: number
  duration: number
  startTime: number
  isCompressed: boolean
  isCritical: boolean
}

export interface NavigationMetric {
  url: string
  loadTime: number
  domContentLoaded: number
  firstByte: number
  redirectCount: number
  redirectTime: number
  dnsTime: number
  connectionTime: number
}

export interface PerformanceIssue {
  type: 'warning' | 'error' | 'info'
  category: 'web-vitals' | 'resources' | 'network' | 'rendering' | 'javascript'
  message: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  metric?: string
  value?: number
  threshold?: number
}

// Main Performance Monitor class
export class PerformanceMonitor {
  private metrics: {
    webVitals: WebVitalMetric[]
    resources: ResourceMetric[]
    navigation: NavigationMetric[]
  } = {
    webVitals: [],
    resources: [],
    navigation: []
  }
  
  private observers: {
    performance?: PerformanceObserver
    resource?: PerformanceObserver
    navigation?: PerformanceObserver
  } = {}
  
  private reportingTimer?: NodeJS.Timeout
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    if (this.initialized) return
    
    try {
      this.setupWebVitalsObserver()
      this.setupResourceObserver()
      this.setupNavigationObserver()
      this.startPerformanceReporting()
      this.monitorRuntimePerformance()
      
      this.initialized = true
      logger.info('Performance Monitor initialized')
    } catch (error) {
      logger.error('Failed to initialize Performance Monitor', error)
    }
  }

  private setupWebVitalsObserver() {
    if (!('PerformanceObserver' in window)) return

    // Observer for paint metrics (FCP)
    try {
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processWebVitalEntry(entry)
        }
      })

      this.observers.performance.observe({ 
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] 
      })
    } catch (error) {
      console.warn('Some performance metrics not supported:', error)
    }

    // Manual CLS tracking
    this.trackCumulativeLayoutShift()
    
    // Manual FID tracking
    this.trackFirstInputDelay()
    
    // Manual INP tracking
    this.trackInteractionToNextPaint()
  }

  private setupResourceObserver() {
    if (!('PerformanceObserver' in window)) return

    try {
      this.observers.resource = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processResourceEntry(entry as PerformanceResourceTiming)
        }
      })

      this.observers.resource.observe({ entryTypes: ['resource'] })
    } catch (error) {
      logger.error('Failed to setup resource observer', error)
    }
  }

  private setupNavigationObserver() {
    if (!('PerformanceObserver' in window)) return

    try {
      this.observers.navigation = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processNavigationEntry(entry as PerformanceNavigationTiming)
        }
      })

      this.observers.navigation.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      logger.error('Failed to setup navigation observer', error)
    }
  }

  private processWebVitalEntry(entry: PerformanceEntry) {
    let metric: WebVitalMetric | null = null

    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          metric = this.createWebVitalMetric('FCP', entry.startTime, entry.name)
        }
        break
      case 'largest-contentful-paint':
        metric = this.createWebVitalMetric('LCP', entry.startTime, entry.name)
        break
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming
        if (navEntry.responseStart > 0) {
          const ttfb = navEntry.responseStart - navEntry.requestStart
          metric = this.createWebVitalMetric('TTFB', ttfb, 'ttfb')
        }
        break
    }

    if (metric) {
      this.metrics.webVitals.push(metric)
      this.analyzeWebVital(metric)
    }
  }

  private processResourceEntry(entry: PerformanceResourceTiming) {
    const resource: ResourceMetric = {
      name: entry.name,
      type: this.getResourceType(entry.name, entry.initiatorType),
      size: entry.transferSize || entry.decodedBodySize || 0,
      duration: entry.duration,
      startTime: entry.startTime,
      isCompressed: (entry.transferSize < entry.decodedBodySize * 0.8),
      isCritical: this.isCriticalResource(entry.name)
    }

    this.metrics.resources.push(resource)
    this.analyzeResource(resource)
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    const navigation: NavigationMetric = {
      url: window.location.href,
      loadTime: entry.loadEventEnd - entry.navigationStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
      firstByte: entry.responseStart - entry.requestStart,
      redirectCount: entry.redirectCount,
      redirectTime: entry.redirectEnd - entry.redirectStart,
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectionTime: entry.connectEnd - entry.connectStart
    }

    this.metrics.navigation.push(navigation)
    this.analyzeNavigation(navigation)
  }

  private createWebVitalMetric(
    name: WebVitalMetric['name'], 
    value: number, 
    id: string
  ): WebVitalMetric {
    const thresholds = PERFORMANCE_CONFIG.thresholds[name.toLowerCase() as keyof typeof PERFORMANCE_CONFIG.thresholds]
    
    let rating: WebVitalMetric['rating'] = 'good'
    if (value > thresholds.needsImprovement) rating = 'poor'
    else if (value > thresholds.good) rating = 'needs-improvement'

    return {
      name,
      value,
      rating,
      delta: value,
      id,
      navigationType: this.getNavigationType()
    }
  }

  private trackCumulativeLayoutShift() {
    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            clsEntries.push(entry)
          }
        }

        // Report CLS periodically
        if (clsEntries.length >= 5) {
          const metric = this.createWebVitalMetric('CLS', clsValue, 'cls')
          this.metrics.webVitals.push(metric)
          this.analyzeWebVital(metric)
          clsEntries = []
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS tracking not supported')
    }
  }

  private trackFirstInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime
          const metric = this.createWebVitalMetric('FID', fid, entry.name)
          this.metrics.webVitals.push(metric)
          this.analyzeWebVital(metric)
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID tracking not supported')
    }
  }

  private trackInteractionToNextPaint() {
    // Track INP using event timing API
    let interactions: number[] = []

    const trackInteraction = (event: Event) => {
      const startTime = performance.now()
      
      requestAnimationFrame(() => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        interactions.push(duration)
        
        if (interactions.length >= 10) {
          const p98 = this.calculatePercentile(interactions, 98)
          const metric = this.createWebVitalMetric('INP', p98, 'inp')
          this.metrics.webVitals.push(metric)
          this.analyzeWebVital(metric)
          interactions = []
        }
      })
    }

    // Track major interaction events
    ['click', 'keydown', 'pointerdown'].forEach(type => {
      document.addEventListener(type, trackInteraction, { passive: true })
    })
  }

  private analyzeWebVital(metric: WebVitalMetric) {
    if (!PERFORMANCE_CONFIG.enableDevelopmentWarnings && process.env.NODE_ENV === 'development') {
      return
    }

    const issues: PerformanceIssue[] = []

    if (metric.rating === 'poor' || metric.rating === 'needs-improvement') {
      const threshold = PERFORMANCE_CONFIG.thresholds[metric.name.toLowerCase() as keyof typeof PERFORMANCE_CONFIG.thresholds]
      
      issues.push({
        type: metric.rating === 'poor' ? 'error' : 'warning',
        category: 'web-vitals',
        message: `${metric.name} is ${metric.rating.replace('-', ' ')}: ${metric.value.toFixed(0)}${this.getMetricUnit(metric.name)}`,
        recommendation: this.getWebVitalRecommendation(metric.name),
        impact: metric.rating === 'poor' ? 'high' : 'medium',
        metric: metric.name,
        value: metric.value,
        threshold: threshold.good
      })
    }

    if (issues.length > 0) {
      this.reportIssues(issues)
    }
  }

  private analyzeResource(resource: ResourceMetric) {
    const issues: PerformanceIssue[] = []

    // Check file sizes
    if (resource.type === 'javascript' && resource.size > PERFORMANCE_CONFIG.resources.maxJSBundleSize) {
      issues.push({
        type: 'warning',
        category: 'resources',
        message: `Large JavaScript bundle: ${this.formatBytes(resource.size)}`,
        recommendation: 'Consider code splitting, tree shaking, or dynamic imports to reduce bundle size',
        impact: 'medium',
        value: resource.size,
        threshold: PERFORMANCE_CONFIG.resources.maxJSBundleSize
      })
    }

    if (resource.type === 'stylesheet' && resource.size > PERFORMANCE_CONFIG.resources.maxCSSBundleSize) {
      issues.push({
        type: 'warning',
        category: 'resources',
        message: `Large CSS file: ${this.formatBytes(resource.size)}`,
        recommendation: 'Consider CSS code splitting, unused CSS removal, or compression',
        impact: 'low',
        value: resource.size,
        threshold: PERFORMANCE_CONFIG.resources.maxCSSBundleSize
      })
    }

    if (resource.type === 'image' && resource.size > PERFORMANCE_CONFIG.resources.maxImageSize) {
      issues.push({
        type: 'warning',
        category: 'resources',
        message: `Large image file: ${this.formatBytes(resource.size)}`,
        recommendation: 'Optimize images using WebP/AVIF formats, proper compression, and responsive images',
        impact: 'medium',
        value: resource.size,
        threshold: PERFORMANCE_CONFIG.resources.maxImageSize
      })
    }

    // Check compression
    if (!resource.isCompressed && resource.size > 10 * 1024) {
      issues.push({
        type: 'info',
        category: 'network',
        message: `Uncompressed resource: ${resource.name}`,
        recommendation: 'Enable gzip or Brotli compression on the server',
        impact: 'low'
      })
    }

    // Check loading performance
    if (resource.isCritical && resource.duration > 2000) {
      issues.push({
        type: 'warning',
        category: 'network',
        message: `Slow critical resource load: ${resource.duration.toFixed(0)}ms`,
        recommendation: 'Optimize critical resource delivery, consider CDN, or preloading',
        impact: 'high',
        value: resource.duration,
        threshold: 2000
      })
    }

    if (issues.length > 0) {
      this.reportIssues(issues)
    }
  }

  private analyzeNavigation(navigation: NavigationMetric) {
    const issues: PerformanceIssue[] = []

    if (navigation.loadTime > 5000) {
      issues.push({
        type: 'error',
        category: 'network',
        message: `Slow page load: ${navigation.loadTime.toFixed(0)}ms`,
        recommendation: 'Optimize critical resources, reduce bundle sizes, improve server response time',
        impact: 'high',
        value: navigation.loadTime,
        threshold: 5000
      })
    }

    if (navigation.firstByte > PERFORMANCE_CONFIG.thresholds.ttfb.needsImprovement) {
      issues.push({
        type: 'warning',
        category: 'network',
        message: `Slow server response: ${navigation.firstByte.toFixed(0)}ms TTFB`,
        recommendation: 'Optimize server performance, database queries, or use a CDN',
        impact: 'medium',
        value: navigation.firstByte,
        threshold: PERFORMANCE_CONFIG.thresholds.ttfb.good
      })
    }

    if (navigation.redirectCount > 2) {
      issues.push({
        type: 'warning',
        category: 'network',
        message: `Too many redirects: ${navigation.redirectCount}`,
        recommendation: 'Minimize redirects by updating links to point directly to final URLs',
        impact: 'low',
        value: navigation.redirectCount,
        threshold: 2
      })
    }

    if (issues.length > 0) {
      this.reportIssues(issues)
    }
  }

  private monitorRuntimePerformance() {
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize

        if (memoryUsage > 0.8) {
          this.reportIssues([{
            type: 'warning',
            category: 'javascript',
            message: `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
            recommendation: 'Check for memory leaks, optimize data structures, or implement pagination',
            impact: 'medium'
          }])
        }
      }

      // Monitor DOM size
      const domNodes = document.querySelectorAll('*').length
      if (domNodes > PERFORMANCE_CONFIG.budget.maxDOMNodes) {
        this.reportIssues([{
          type: 'info',
          category: 'rendering',
          message: `Large DOM size: ${domNodes} elements`,
          recommendation: 'Consider virtual scrolling, pagination, or component lazy loading',
          impact: 'low',
          value: domNodes,
          threshold: PERFORMANCE_CONFIG.budget.maxDOMNodes
        }])
      }
    }, 30000) // Check every 30 seconds
  }

  private startPerformanceReporting() {
    if (!PERFORMANCE_CONFIG.enableReporting) return

    this.reportingTimer = setInterval(() => {
      this.generatePerformanceReport()
    }, PERFORMANCE_CONFIG.reportingInterval)
  }

  // Helper methods
  private getResourceType(url: string, initiatorType: string): string {
    if (initiatorType === 'img' || /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url)) return 'image'
    if (initiatorType === 'script' || /\.js$/i.test(url)) return 'javascript'
    if (initiatorType === 'link' || /\.css$/i.test(url)) return 'stylesheet'
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') return 'xhr'
    return initiatorType || 'other'
  }

  private isCriticalResource(url: string): boolean {
    // Define critical resources
    const criticalPatterns = [
      /\/app\//,           // App routes
      /\/layout/,          // Layout files
      /\/page/,            // Page components
      /main.*\.js$/,       // Main bundles
      /framework.*\.js$/,  // Framework bundles
      /globals\.css$/,     // Global styles
    ]

    return criticalPatterns.some(pattern => pattern.test(url))
  }

  private getNavigationType(): WebVitalMetric['navigationType'] {
    if (!('navigation' in performance)) return 'navigate'
    
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    switch (navEntry.type) {
      case 'reload': return 'reload'
      case 'back_forward': return 'back-forward'
      case 'prerender': return 'prerender'
      default: return 'navigate'
    }
  }

  private getWebVitalRecommendation(metric: WebVitalMetric['name']): string {
    const recommendations = {
      FCP: 'Optimize critical resources, reduce render-blocking scripts, improve server response time',
      LCP: 'Optimize largest contentful element, preload critical resources, improve server performance',
      FID: 'Reduce JavaScript execution time, break up long tasks, use web workers for heavy computation',
      CLS: 'Add size attributes to images/videos, avoid inserting content above existing content, use CSS containment',
      TTFB: 'Optimize server performance, use CDN, improve database queries, consider edge computing',
      INP: 'Optimize event handlers, reduce main thread blocking, use requestIdleCallback for non-critical work'
    }

    return recommendations[metric] || 'Optimize for better user experience'
  }

  private getMetricUnit(metric: WebVitalMetric['name']): string {
    return metric === 'CLS' ? '' : 'ms'
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    
    if (Math.floor(index) === index) {
      return sorted[index]
    } else {
      const lower = sorted[Math.floor(index)]
      const upper = sorted[Math.ceil(index)]
      return lower + (upper - lower) * (index - Math.floor(index))
    }
  }

  private reportIssues(issues: PerformanceIssue[]) {
    if (PERFORMANCE_CONFIG.enableDevelopmentWarnings) {
      issues.forEach(issue => {
        const logMethod = issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warn' : 'info'
        console[logMethod](`[Performance ${issue.type}] ${issue.message}\n💡 ${issue.recommendation}`)
      })
    }

    // Send to analytics or monitoring service in production
    if (PERFORMANCE_CONFIG.enableReporting) {
      // Implement your preferred monitoring service here
      logger.info('Performance issues detected', { issues })
    }
  }

  // Public API
  public getMetrics() {
    return { ...this.metrics }
  }

  public getWebVitalsSummary() {
    const latest = this.metrics.webVitals.reduce((acc, metric) => {
      acc[metric.name] = metric
      return acc
    }, {} as Record<string, WebVitalMetric>)

    return latest
  }

  public generatePerformanceReport() {
    const metrics = this.getMetrics()
    const webVitals = this.getWebVitalsSummary()
    
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      webVitals: Object.values(webVitals).map(metric => ({
        name: metric.name,
        value: metric.value,
        rating: metric.rating
      })),
      resources: {
        total: metrics.resources.length,
        totalSize: metrics.resources.reduce((sum, r) => sum + r.size, 0),
        compressed: metrics.resources.filter(r => r.isCompressed).length,
        critical: metrics.resources.filter(r => r.isCritical).length,
      },
      navigation: metrics.navigation[metrics.navigation.length - 1],
      score: this.calculateOverallScore()
    }

    if (PERFORMANCE_CONFIG.enableDevelopmentWarnings) {
      console.group('📊 Performance Report')
      console.table(report.webVitals)
      console.log('Resources:', report.resources)
      console.log('Overall Score:', report.score)
      console.groupEnd()
    }

    return report
  }

  private calculateOverallScore(): number {
    const webVitals = this.getWebVitalsSummary()
    const metrics = ['FCP', 'LCP', 'FID', 'CLS'] as const
    let totalScore = 0
    let validMetrics = 0

    metrics.forEach(metricName => {
      const metric = webVitals[metricName]
      if (metric) {
        let score = 100
        if (metric.rating === 'needs-improvement') score = 60
        if (metric.rating === 'poor') score = 30
        
        totalScore += score
        validMetrics++
      }
    })

    return validMetrics > 0 ? Math.round(totalScore / validMetrics) : 0
  }

  public destroy() {
    Object.values(this.observers).forEach(observer => {
      observer?.disconnect()
    })
    
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer)
    }
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor && typeof window !== 'undefined') {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor!
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return {
      metrics: { webVitals: [], resources: [], navigation: [] },
      webVitals: {},
      report: null,
      score: 0
    }
  }

  const monitor = getPerformanceMonitor()
  
  return {
    metrics: monitor.getMetrics(),
    webVitals: monitor.getWebVitalsSummary(),
    report: monitor.generatePerformanceReport(),
    score: monitor.calculateOverallScore?.() || 0
  }
}

// Initialize performance monitoring on page load
if (typeof window !== 'undefined') {
  // Wait for page load to start monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => getPerformanceMonitor(), 1000)
    })
  } else {
    setTimeout(() => getPerformanceMonitor(), 1000)
  }
}